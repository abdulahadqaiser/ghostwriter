const express = require('express');
const router = express.Router();
const VoiceProfile = require('../models/VoiceProfile');
const mindsService = require('../services/mindsService');
const { compressTranscriptWithTone, generateRepurposedContent: generateGeminiRepurposedContent } = require('../services/geminiService');

const DEFAULT_USER_ID = 'default-creator';

const { createHistoryEntry } = require('./history');

function generateTitle(text) {
  const clean = text.replace(/["'\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
  const firstSentence = clean.split(/[.!?]/)[0];
  if (firstSentence.length >= 8 && firstSentence.length <= 48) {
    return firstSentence;
  }
  return clean.length > 45 ? clean.slice(0, 42) + '...' : clean;
}

// POST /api/repurpose - Main repurposing endpoint
router.post('/', async (req, res) => {
  try {
    const { sourceContent } = req.body;

    // ── Input Validation ───────────────────────────────────────────────────
    if (!sourceContent || typeof sourceContent !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'sourceContent is required and must be a string.'
      });
    }

    const trimmed = sourceContent.trim();

    if (!trimmed) {
      return res.status(400).json({
        success: false,
        error: 'sourceContent cannot be empty. Please paste your transcript or article text.'
      });
    }

    // Raised to 50k since Gemini now handles compression for long content
    const MAX_CHARS = 50000;
    if (trimmed.length > MAX_CHARS) {
      return res.status(400).json({
        success: false,
        error: `sourceContent exceeds the ${MAX_CHARS.toLocaleString()}-character limit (received ${trimmed.length.toLocaleString()} chars). Please shorten the content.`
      });
    }

    // ── AI Engine Selection (Minds API or Google Gemini Engine) ─────────────
    // Both engines are fully supported in production & development.
    const activeEngine = req.body.engine === 'gemini' ? 'gemini' : 'minds';

    // Retrieve creator voice profile from MongoDB based on userId
    const userId = req.body.userId || req.headers['x-user-id'] || DEFAULT_USER_ID;
    let profile = await VoiceProfile.findOne({ userId });
    if (!profile) {
      profile = new VoiceProfile({ userId });
      await profile.save();
    }

    console.log(`[Repurpose API] Processing request for user: ${userId} (${trimmed.length.toLocaleString()} chars) | Active Engine: ${activeEngine}`);

    // ── Gemini Context Compression ─────────────────────────────────────────
    // If the transcript exceeds the token budget (~9000 chars),
    // Gemini compresses it while preserving the creator's voice.
    const compressionResult = await compressTranscriptWithTone(trimmed, profile);
    const contentForMinds = compressionResult.compressed;

    if (compressionResult.wasCompressed) {
      console.log(`[Repurpose API] Gemini compressed: ${compressionResult.originalLength} → ${compressionResult.compressedLength} chars`);
    }

    // Route request to selected engine (Gemini Dev Mode or Production Minds Engine)
    let result;
    if (activeEngine === 'gemini') {
      console.log(`[Repurpose API] Executing generation via Live Gemini API (Dev Fallback)...`);
      result = await generateGeminiRepurposedContent(profile, contentForMinds);
    } else {
      console.log(`[Repurpose API] Executing generation via Production Minds Engine...`);
      result = await mindsService.generateRepurposedContent(profile, contentForMinds);
    }

    // Attach compression meta to the response
    result.sentToMindsChars = contentForMinds.length;
    result.sentToMindsContent = contentForMinds;
    result.meta = result.meta || {};
    result.meta.compression = {
      wasCompressed: compressionResult.wasCompressed,
      originalChars: compressionResult.originalLength,
      compressedChars: compressionResult.compressedLength,
      sentToMindsChars: contentForMinds.length,
      engine: compressionResult.wasCompressed
        ? (compressionResult.fallback ? 'truncation-fallback' : 'gemini-fallback-chain')
        : 'raw-pass-through'
    };

    // Save to history on successful generation
    if (result && result.success && result.data) {
      try {
        const title = generateTitle(trimmed);
        const historyRecord = await createHistoryEntry(title, trimmed, result.data, result.meta, userId);
        result.historyItem = historyRecord;
      } catch (histErr) {
        console.warn('[Repurpose API] Failed to save history entry:', histErr.message);
      }
    }

    res.json(result);
  } catch (err) {
    console.error('[Repurpose API] Error during repurposing:', err);
    const statusCode = err.statusCode || 500;
    const userMessage =
      statusCode === 504
        ? 'Generation failed: The Minds AI took too long to respond. Please try again.'
        : statusCode === 503
          ? 'Generation failed: The Minds AI returned an invalid response. Please try again.'
          : 'Generation failed: An unexpected error occurred. Please try again.';
    res.status(statusCode).json({
      success: false,
      error: userMessage,
      detail: err.message
    });
  }
});

module.exports = router;
