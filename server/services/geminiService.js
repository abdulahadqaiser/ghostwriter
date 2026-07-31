/**
 * geminiService.js — Google Gemini AI Integration
 *
 * Two core capabilities:
 *   1. compressTranscriptWithTone() — Tone-preserving context compression
 *      for transcripts that exceed the Animoca Minds API token window.
 *   2. suggestCorrectionRule() — Analyzes a user edit diff and proposes
 *      a stylistic rule for the RLHF learning loop.
 *
 * The Gemini key NEVER leaves the backend.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Primary & fallback models to bypass quota rate limits
const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.6-flash',
  'gemma-4-26b-a4b-it',
  'gemini-2.0-flash'
];

/**
 * Execute generateContent across the fallback model list if a model hits rate limits (429).
 */
async function generateWithFallback(prompt) {
  let lastError = null;

  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      if (responseText) {
        console.log(`[GeminiService] Successfully generated using model: ${modelName}`);
        return responseText;
      }
    } catch (err) {
      console.warn(`[GeminiService] Model ${modelName} failed (${err.message}). Trying next fallback...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All fallback models failed to respond.');
}

// ─── CHARACTER THRESHOLDS ─────────────────────────────────────────────────────
const COMPRESSION_TRIGGER = 9000;  // compress if source > 9,000 chars
const TARGET_CHARS         = 5000; // compress down to 5,000 chars for Minds API

/**
 * Feature 1: Tone-Preserving Context Compression
 *
 * If a transcript exceeds the Minds API token budget, Gemini condenses it
 * while preserving the creator's authentic voice characteristics.
 *
 * @param {string}  transcript   Raw source content
 * @param {object}  voiceProfile Mongoose VoiceProfile document
 * @returns {{ compressed: string, wasCompressed: boolean, originalLength: number, compressedLength: number }}
 */
async function compressTranscriptWithTone(transcript, voiceProfile) {
  if (!transcript || transcript.length <= COMPRESSION_TRIGGER) {
    return {
      compressed: transcript,
      wasCompressed: false,
      originalLength: transcript?.length || 0,
      compressedLength: transcript?.length || 0
    };
  }

  console.log(`[GeminiService] Transcript is ${transcript.length.toLocaleString()} chars (limit ${COMPRESSION_TRIGGER.toLocaleString()}). Compressing...`);

  // Build voice context for the compression prompt
  const toneStr    = voiceProfile?.extractedTraits?.tone?.join(', ') || 'Direct, authentic';
  const killList   = voiceProfile?.killList?.join(', ')              || 'delve, tapestry, unlock, synergy';
  const corrections = (voiceProfile?.corrections || []).map((c, i) => {
    if (typeof c === 'string') return `${i + 1}. ${c}`;
    if (c.learnedRule) return `${i + 1}. ${c.learnedRule}`;
    return null;
  }).filter(Boolean).join('\n') || 'None';

  const prompt = `You are an aggressive content compressor for a high-performance creator engine.

The user provided a massive transcript (${transcript.length.toLocaleString()} characters). You MUST condense this down to STRICTLY 3,000 to 4,000 characters.

=== MANDATORY COMPRESSION REQUIREMENTS ===
1. ABSOLUTE LENGTH LIMIT: Your total output MUST NOT EXCEED 4,000 CHARACTERS. Drop all fluff, tangents, intro greetings, and repetitive examples.
2. DO NOT add any meta-commentary like "Here is a summary" or "The creator discusses...". Output ONLY the condensed core content.
3. Keep the 4-5 most impactful insights, quotes, and core arguments.

=== CRITICAL VOICE CONSTRAINTS ===
Tone: ${toneStr}
FORBIDDEN words (NEVER use these): ${killList}
Learned user rules:
${corrections}

=== TRANSCRIPT TO COMPRESS ===
${transcript}`;

  try {
    const responseText = await generateWithFallback(prompt);
    let compressed = responseText.trim();

    // ── Hard Guardrail: Enforce Max 4,500 Characters ─────────────────────────
    const MAX_ALLOWED = 4500;
    if (compressed.length > MAX_ALLOWED) {
      console.warn(`[GeminiService] Gemini returned ${compressed.length.toLocaleString()} chars (exceeded ${MAX_ALLOWED} limit). Enforcing sentence-boundary hard cap...`);
      const slice = compressed.slice(0, MAX_ALLOWED);
      const lastPeriod = slice.lastIndexOf('.');
      compressed = lastPeriod > 2000 ? slice.slice(0, lastPeriod + 1) : slice;
    }

    console.log(`[GeminiService] Compressed: ${transcript.length.toLocaleString()} → ${compressed.length.toLocaleString()} chars (${Math.round((1 - compressed.length / transcript.length) * 100)}% reduction)`);

    return {
      compressed,
      wasCompressed: true,
      originalLength: transcript.length,
      compressedLength: compressed.length
    };
  } catch (err) {
    console.error('[GeminiService] Compression failed, falling back to truncation:', err.message);
    // Graceful fallback: hard-truncate at sentence boundary
    const truncated = transcript.slice(0, TARGET_CHARS);
    const lastPeriod = truncated.lastIndexOf('.');
    const fallback = lastPeriod > TARGET_CHARS * 0.6
      ? truncated.slice(0, lastPeriod + 1)
      : truncated;

    return {
      compressed: fallback,
      wasCompressed: true,
      originalLength: transcript.length,
      compressedLength: fallback.length,
      fallback: true
    };
  }
}

/**
 * Feature 2: Auto-Rule Suggestion (RLHF Correction Analyzer)
 *
 * When a user manually edits AI-generated output, Gemini analyzes the diff
 * and proposes a concise stylistic rule that explains the edit pattern.
 *
 * @param {string} originalText  The AI-generated text before user edit
 * @param {string} editedText    The user's corrected version
 * @returns {{ suggestedRule: string }}
 */
async function suggestCorrectionRule(originalText, editedText) {
  if (!originalText || !editedText) {
    return { suggestedRule: '' };
  }

  const prompt = `You are a writing style analyst for a content repurposing tool.

Compare these two texts. The AI generated the "ORIGINAL" text. The human creator then edited it to become the "EDITED" text.

=== ORIGINAL (AI-generated) ===
${originalText.slice(0, 3000)}

=== EDITED (Human-corrected) ===
${editedText.slice(0, 3000)}

=== YOUR TASK ===
Identify what stylistic, grammatical, or formatting rule the human was enforcing.

Examples of good rules:
- "Never use emojis in X threads"
- "Use shorter sentences — max 15 words each"
- "Always end Instagram captions with a call-to-action question"
- "Remove the word 'delve' — use 'explore' instead"
- "Don't start tweets with 'Just' or 'So'"
- "Use em-dashes instead of semicolons"

Formulate a SINGLE, concise, instructional rule based on this specific edit. The rule should be actionable and specific enough that an AI could follow it in future generations.

Return ONLY the rule string. No quotes, no explanation, no preamble.`;

  try {
    const responseText = await generateWithFallback(prompt);
    const suggestedRule = responseText.trim().replace(/^["']|["']$/g, '');

    console.log(`[GeminiService] Suggested rule: "${suggestedRule}"`);

    return { suggestedRule };
  } catch (err) {
    console.error('[GeminiService] Rule suggestion failed:', err.message);
    return { suggestedRule: '' };
  }
}

/**
 * Feature 3: Dev-Mode AI Engine Generation (Live Gemini API Fallback)
 *
 * Generates platform-native repurposed content directly via Gemini API.
 * Uses the exact same prompt rules, voice profile traits, kill list, and JSON safety net
 * as mindsService.
 *
 * @param {object} voiceProfile Mongoose VoiceProfile document
 * @param {string} sourceContent Raw source text or compressed content
 * @returns {object} Response matching Minds API output format:
 *   { success: true, data: { x_thread, instagram_caption, youtube_post }, meta: { mode: "Live Gemini API (Dev Fallback)", ... } }
 */
async function generateRepurposedContent(voiceProfile, sourceContent) {
  const mindsService = require('./mindsService');

  const chunkedContent = mindsService.truncateOrChunkText(sourceContent);
  const { fullPrompt } = mindsService.buildPromptParts(voiceProfile, chunkedContent);

  console.log(`[GeminiService] Generating repurposed content via Gemini API... (Source text: ${chunkedContent.length.toLocaleString()} chars)`);

  try {
    const rawResponse = await generateWithFallback(fullPrompt);
    const validatedJson = mindsService.extractAndValidateJson(rawResponse);

    return {
      success: true,
      data: validatedJson,
      meta: {
        mode: 'Live Gemini API',
        creditsUsed: 0,
        skillTriggered: 'Gemini-Engine',
        timestamp: new Date().toISOString()
      }
    };
  } catch (err) {
    console.error('[GeminiService] Content generation failed:', err.message);
    throw err;
  }
}

module.exports = {
  compressTranscriptWithTone,
  suggestCorrectionRule,
  generateRepurposedContent,
  COMPRESSION_TRIGGER,
  TARGET_CHARS
};
