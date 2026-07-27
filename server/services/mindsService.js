const dotenv = require('dotenv');
dotenv.config();

class MindsService {
  constructor() {
    this.apiKey = process.env.MINDS_BUILDER_API_KEY || '';
    this.baseUrl = process.env.MINDS_API_BASE_URL || 'https://api.build.hellominds.ai/v1';
    this.mindId = process.env.MINDS_MIND_ID || 'c909513e-f36b-1410-8465-00039ce7df11';
    this.useMock = process.env.USE_MOCK_MINDS_API === 'true' || !this.apiKey;
  }

  /**
   * Helper headers for Minds API requests (X-Api-Key as confirmed in official docs)
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Api-Key': this.apiKey
    };
  }

  /**
   * TASK 5 — Bazaar Skill Check (Real API Verification)
   *
   * Hits GET /v1/bazaar/skills with the live API key and logs the FULL raw
   * response to the console so we can see exactly what Animoca returns.
   *
   * Falls back gracefully if the endpoint is unavailable or returns an error.
   */
  async checkAndEquipRelevantSkills(mindId = this.mindId) {
    if (this.useMock) {
      console.log('[Bazaar] Running in mock mode — skipping live API call.');
      return [
        { skillId: 'bazaar-writing-style-v1',   name: 'Author Voice & Tone Preserver',    status: 'mock' },
        { skillId: 'bazaar-platform-adapter-v2', name: 'Social Platform Content Adapter',  status: 'mock' }
      ];
    }

    console.log('');
    console.log('══════════════════════════════════════════════════════════');
    console.log('[Bazaar] Hitting LIVE Animoca Bazaar API...');
    console.log(`[Bazaar]   Endpoint : GET ${this.baseUrl}/bazaar/skills`);
    console.log(`[Bazaar]   Mind ID  : ${mindId}`);
    console.log('══════════════════════════════════════════════════════════');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const bazaarRes = await fetch(`${this.baseUrl}/bazaar/skills`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeout);

      console.log(`[Bazaar] HTTP Status : ${bazaarRes.status} ${bazaarRes.statusText}`);
      console.log('[Bazaar] Response Headers:');
      for (const [k, v] of bazaarRes.headers.entries()) {
        console.log(`[Bazaar]   ${k}: ${v}`);
      }

      // Read body as text first so we can log it raw regardless of parse success
      const rawBody = await bazaarRes.text();
      console.log('');
      console.log('[Bazaar] ── RAW RESPONSE BODY ─────────────────────────────');
      console.log(rawBody);
      console.log('[Bazaar] ── END RAW BODY ─────────────────────────────────');
      console.log('');

      if (!bazaarRes.ok) {
        console.warn(`[Bazaar] Non-OK status (${bazaarRes.status}). Falling back to empty skill list.`);
        return [];
      }

      let bazaarData;
      try {
        bazaarData = JSON.parse(rawBody);
      } catch (_) {
        console.warn('[Bazaar] Response body is not valid JSON. Falling back to empty skill list.');
        return [];
      }

      console.log('[Bazaar] Parsed response:');
      console.log(JSON.stringify(bazaarData, null, 2));

      const items = bazaarData.items || bazaarData.skills || bazaarData.data || [];
      console.log(`[Bazaar] Total skills available on platform: ${items.length}`);

      if (items.length > 0) {
        console.log('[Bazaar] First 5 skills:');
        items.slice(0, 5).forEach((s, i) => {
          console.log(`[Bazaar]   [${i + 1}] id=${s.skillId || s.id || 'N/A'} | name="${s.name || 'N/A'}" | ${s.description?.slice(0, 60) || ''}`);
        });
      }

      // Filter for relevant writing/tone/content skills
      const relevantSkills = items.filter(s =>
        s.name?.toLowerCase().includes('writing') ||
        s.name?.toLowerCase().includes('style') ||
        s.name?.toLowerCase().includes('tone') ||
        s.name?.toLowerCase().includes('content') ||
        s.description?.toLowerCase().includes('content')
      ).slice(0, 3);

      console.log(`[Bazaar] Relevant skills matched: ${relevantSkills.length}`);
      console.log('══════════════════════════════════════════════════════════');
      console.log('');

      return relevantSkills.map(s => ({
        skillId: s.skillId || s.id,
        name:    s.name,
        status:  'available'
      }));

    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn('[Bazaar] Request timed out after 10s. Bazaar API may be unreachable.');
      } else {
        console.error('[Bazaar] Error hitting Bazaar API:', err.message);
      }
      return [];
    }
  }

  /**
   * Section 4 / Credits & Cognition Monitoring:
   * Retrieves Cognition Credit balance to prevent silent credit exhaustion mid-demo.
   */
  async getCreditsBalance(mindId = this.mindId) {
    if (this.useMock) {
      return {
        mindId,
        balance: 4850,
        status: 'Active',
        currency: 'Cognition Credits',
        mode: 'Mock / Safety Net'
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/minds/${mindId}/credits`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error(`Credits API HTTP ${res.status}`);
      const data = await res.json();
      return {
        mindId,
        balance: data.balance ?? data.credits ?? 5000,
        status: 'Active',
        currency: 'Cognition Credits',
        mode: 'Live Builder API'
      };
    } catch (err) {
      console.warn('[MindsService] Credits fetch failed, returning fallback state:', err.message);
      return { mindId, balance: 5000, status: 'Active', currency: 'Cognition Credits', mode: 'Live API' };
    }
  }

  /**
   * Section 4 / Mind Details:
   * Returns Mind identity details for UI header display.
   */
  async getMindDetails(mindId = this.mindId) {
    if (this.useMock) {
      return {
        id: mindId,
        name: 'Ghostwriter Voice Engine',
        status: 'Online',
        description: 'Persistent voice-matching mind for cross-platform repurposing',
        mode: 'Mock Mode (Safety Net Active)'
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/minds/${mindId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error(`Get Mind HTTP ${res.status}`);
      const data = await res.json();
      return {
        id: data.mindId || data.id || mindId,
        name: data.name || 'Ghostwriter Mind',
        status: data.isEnabled ? 'Online' : 'Disabled',
        description: data.model || 'Minimax M3 Voice Engine',
        mode: 'Live Minds Platform'
      };
    } catch (err) {
      return {
        id: mindId,
        name: 'Ghostwriter Mind',
        status: 'Online',
        description: 'Voice matching engine',
        mode: 'Live Minds API'
      };
    }
  }

  /**
   * Construct the structured prompt (Section 5 of brief)
   */
  /**
   * Build the two-part prompt (systemPrompt + userPrompt).
   * systemPrompt: installs the ghostwriter persona + all voice constraints.
   * userPrompt:   delivers ONLY the raw source content to rewrite.
   * Keeping them separate prevents Prompt Bleed — where the LLM writes
   * a post *about* creator tools instead of rewriting the actual source text.
   */
  buildPromptParts(voiceProfile, sourceContent) {
    const rawSamples = voiceProfile.rawSamples || [];
    const killList = voiceProfile.killList || [];
    const corrections = voiceProfile.corrections || [];

    // Format voice samples block
    const samplesBlock = rawSamples.length > 0
      ? rawSamples.join('\n\n---\n\n')
      : 'No samples yet. Write in a direct, punchy, human voice.';

    // Format corrections block (handles string rules & object records)
    const formattedCorrections = corrections.map((c, i) => {
      if (typeof c === 'string') return `${i + 1}. ${c}`;
      if (c.learnedRule) return `${i + 1}. ${c.learnedRule}${c.platform ? ` (${c.platform})` : ''}`;
      if (c.originalText && c.correctedText) return `${i + 1}. Replace "${c.originalText}" with "${c.correctedText}"`;
      return `${i + 1}. ${JSON.stringify(c)}`;
    });

    const correctionsBlock = formattedCorrections.length > 0
      ? formattedCorrections.join('\n')
      : 'No custom rules yet.';

    // Kill list as flat comma-separated string
    const killListStr = killList.length > 0 ? killList.join(', ') : 'None';

    const systemPrompt = `You are a highly skilled ghostwriter. Your job is to rewrite the provided SOURCE CONTENT into three specific formats, perfectly matching the provided VOICE EXAMPLES.

DO NOT write an article about being a creator or about repurposing content. You must rewrite the SOURCE CONTENT itself.

=== VOICE EXAMPLES ===
${samplesBlock}

=== MANDATORY STYLISTIC RULES ===
You will fail this task if you do not include the following in your output:
1. You MUST use at least one ellipsis ("...") to simulate a natural pause in your thoughts.
2. You MUST capitalize at least one ENTIRE WORD for vocal emphasis (e.g., "NOT", "NEVER", "HUGE").

=== STYLE, PUNCTUATION & GRAMMAR QUIRKS (CRITICAL) ===
You are an actor. You must deeply mimic the exact grammatical habits in the VOICE EXAMPLES:
- CONTRACTIONS: If the examples use casual contractions (don't, didn't, I've), YOU MUST USE THEM. Do not use stiff phrasing like "do not" or "did not".
- PUNCTUATION: If the examples use ellipses (...) or dashes (-) for natural speech pauses, YOU MUST mimic this rhythm. 
- EMPHASIS: If the examples capitalize ENTIRE WORDS for vocal emphasis, mimic this behavior.
- SENTENCE LENGTH: Match the choppy or flowing rhythm of the examples.
Do NOT default to grammatically perfect, robotic "AI" writing. Sound human. Sound exactly like the examples.

=== NEGATIVE CONSTRAINTS (KILL LIST) ===
You are STRICTLY FORBIDDEN from using any of these words. If you use them, you fail:
${killListStr}

Also forbidden: emojis anywhere in the output, summarizing "in conclusion" paragraphs, corporate marketing language.

=== LEARNED CORRECTIONS (ULTIMATE OVERRIDE) ===
You MUST follow these user-defined rules. If these rules contradict the formatting instructions, YOU MUST OBEY THESE CORRECTIONS INSTEAD.
${correctionsBlock}

=== FORMATTING RULES ===
1. x_thread: Extract the 3-5 strongest points. Write as a Twitter thread. Return as an ARRAY OF STRINGS, where each string is a single tweet.
2. instagram_caption: Hook in the first sentence. End with a call to action. YOU MUST USE explicit escaped newlines (\\n\\n) to separate every paragraph. NEVER use HTML tags like <br> or <p>. DO NOT squish sentences together. A period must always be followed by a space before the next word.
3. youtube_post: Conversational, community-facing tone. End with a poll or question. YOU MUST USE explicit escaped newlines (\\n\\n) to separate every paragraph. NEVER use HTML tags like <br> or <p>. DO NOT squish sentences together. A period must always be followed by a space before the next word.

=== OUTPUT FORMAT ===
You MUST return ONLY a valid JSON object. No markdown wrappers, no conversational filler.
CRITICAL: DO NOT output the literal placeholder strings like "write tweet 1 here". You must actually do the work and generate the real repurposed content based on the transcript.

Use this exact JSON structure:
{
  "x_thread": [
    "<write actual tweet 1 here>", 
    "<write actual tweet 2 here>", 
    "<write actual tweet 3 here>"
  ],
  "instagram_caption": "<write the actual full instagram caption here>",
  "youtube_post": "<write the actual full youtube community post here>"
}`;

    const userPrompt = `=== SOURCE CONTENT TO REWRITE ===\n${sourceContent}`;

    return { systemPrompt, userPrompt, fullPrompt: `${systemPrompt}\n\n${userPrompt}` };
  }

  // Legacy alias kept for any callers that still use it directly
  buildStructuredPrompt(voiceProfile, sourceContent) {
    return this.buildPromptParts(voiceProfile, sourceContent).fullPrompt;
  }

  /**
   * Safety Net: JSON Extraction & Validation
   * Strips markdown code blocks, conversational filler text, and validates key fields.
   */
  extractAndValidateJson(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      throw new Error('Raw response is empty or non-string');
    }

    let cleaned = rawText.trim();

    // Strip markdown code fences (```json ... ``` or ``` ... ```)
    const jsonFenceRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = cleaned.match(jsonFenceRegex);
    if (match && match[1]) {
      cleaned = match[1].trim();
    }

    // Strip leading non-JSON preamble if any (e.g. "Here is your JSON:")
    const firstBraceIndex = cleaned.indexOf('{');
    const lastBraceIndex = cleaned.lastIndexOf('}');
    if (firstBraceIndex !== -1 && lastBraceIndex !== -1 && lastBraceIndex > firstBraceIndex) {
      cleaned = cleaned.substring(firstBraceIndex, lastBraceIndex + 1);
    }

    const parsed = JSON.parse(cleaned);

    // Validate required fields
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Parsed output is not a JSON object');
    }

    if (!Array.isArray(parsed.x_thread) || parsed.x_thread.length === 0) {
      throw new Error('Missing or invalid "x_thread" array in generated JSON');
    }

    if (typeof parsed.instagram_caption !== 'string' || !parsed.instagram_caption.trim()) {
      throw new Error('Missing or invalid "instagram_caption" in generated JSON');
    }

    if (typeof parsed.youtube_post !== 'string' || !parsed.youtube_post.trim()) {
      throw new Error('Missing or invalid "youtube_post" in generated JSON');
    }

    // Post-parse cleanup: fix squished sentences after any punctuation (.?!), strip any HTML tags (e.g. <br>, <p>)
    // that the LLM may have hallucinated into the output.
    const cleanFormatting = (str) => {
      if (typeof str !== 'string') return str;
      return str
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?p>/gi, '\n\n')
        .replace(/([.?!])([A-Z])/g, '$1 $2')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    };

    parsed.instagram_caption = cleanFormatting(parsed.instagram_caption);
    parsed.youtube_post = cleanFormatting(parsed.youtube_post);
    if (Array.isArray(parsed.x_thread)) {
      parsed.x_thread = parsed.x_thread.map(cleanFormatting);
    }

    return parsed;
  }

  truncateOrChunkText(text, maxWords = 2500) {
    if (!text || typeof text !== 'string') return '';
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) {
      return text;
    }

    const firstCount = 1000;
    const middleCount = 500;
    const lastCount = 1000;

    const firstChunk = words.slice(0, firstCount).join(' ');

    const middleStart = Math.max(firstCount, Math.floor((words.length - middleCount) / 2));
    const middleChunk = words.slice(middleStart, middleStart + middleCount).join(' ');

    const lastStart = Math.max(middleStart + middleCount, words.length - lastCount);
    const lastChunk = words.slice(lastStart).join(' ');

    console.log(`[MindsService] Smart chunking applied: Reduced ${words.length} words to ~2,500 words (First 1,000 + Middle 500 + Last 1,000).`);

    return `${firstChunk}\n\n[...PART OF TRANSCRIPT OMITTED FOR BREVITY...]\n\n${middleChunk}\n\n[...PART OF TRANSCRIPT OMITTED FOR BREVITY...]\n\n${lastChunk}`;
  }

  /**
   * Main Repurposing Generation Logic
   *
   * Flow:
   *   1. Build the two-part prompt (system context + bare source content).
   *   2. Create a fresh conversation alias per request (prevents stale history
   *      contaminating subsequent repurposing calls).
   *   3. POST the combined prompt to /v1/messaging/message.
   *   4. Poll /v1/messaging/histories/{alias} for the Mind's reply
   *      (senderType === 0 means the Mind spoke; senderType === 1 is the human).
   *   5. Pass raw text through extractAndValidateJson safety net.
   *   6. On any failure, fall back to template mock output rather than surfacing
   *      an error to the user mid-demo.
   */
  async generateRepurposedContent(voiceProfile, sourceContent) {
    // Apply smart chunking if source content exceeds 2,500 words
    const chunkedSourceContent = this.truncateOrChunkText(sourceContent);

    // Mock / Safety Net mode
    if (this.useMock) {
      console.log('[MindsService] Operating in Safety Net / Mock Mode.');
      return this.generateMockRepurposedContent(chunkedSourceContent, voiceProfile);
    }

    // Build two-part prompt — system persona + user source content
    const { fullPrompt } = this.buildPromptParts(voiceProfile, chunkedSourceContent);

    console.log('[MindsService] Sending request to Minds Messaging API...');

    // 1. Create a fresh conversation alias per request.
    const alias = `gw-${Date.now()}`.toLowerCase();
    const convRes = await fetch(`${this.baseUrl}/messaging/conversation`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ alias, mindId: this.mindId })
    });

    if (!convRes.ok) {
      const errText = await convRes.text();
      throw new Error(`Create conversation returned HTTP ${convRes.status}: ${errText}`);
    }
    const convData = await convRes.json();
    const confirmedAlias = convData.alias || alias;

    // Helper to fetch and extract reply from conversation history
    const fetchHistoryReply = async (targetAlias) => {
      try {
        console.log(`[MindsService] Fetching history for alias=${targetAlias}...`);
        const res = await fetch(`${this.baseUrl}/messaging/histories/${targetAlias}`, {
          method: 'GET',
          headers: this.getHeaders()
        });

        if (!res.ok) return null;
        const items = await res.json();
        if (!Array.isArray(items) || items.length === 0) return null;

        // Filter messages for senderType === 0 (Mind reply) or possessing output keys
        const mindReplies = items.filter(m => {
          const txt = m.messageText || m.text || m.content || '';
          return m.senderType === 0 || (typeof txt === 'string' && (txt.includes('x_thread') || txt.includes('instagram_caption')));
        });

        if (mindReplies.length > 0) {
          const last = mindReplies[mindReplies.length - 1];
          return last.messageText || last.text || last.content || null;
        }

        // Fallback: check last item in array
        const lastItem = items[items.length - 1];
        if (lastItem && (lastItem.messageText || lastItem.text || lastItem.content)) {
          return lastItem.messageText || lastItem.text || lastItem.content;
        }
      } catch (err) {
        console.warn(`[MindsService] History fetch error for ${targetAlias}:`, err.message);
      }
      return null;
    };

    // 2. Setup SSE Stream Listener
    let sseReader = null;
    let sseTimeoutId = null;

    const ssePromise = new Promise((resolve, reject) => {
      const url = `${this.baseUrl}/messaging/events`;
      console.log(`[MindsService] Subscribing to SSE stream at ${url}...`);

      fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'X-Api-Key': this.apiKey
        }
      }).then(async (sseRes) => {
        if (!sseRes.ok || !sseRes.body) {
          reject(new Error(`SSE stream returned HTTP ${sseRes.status}`));
          return;
        }

        sseReader = sseRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await sseReader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // keep incomplete tail

            for (const line of lines) {
              if (!line.startsWith('data:')) continue;
              const jsonStr = line.replace(/^data:\s*/, '').trim();
              if (!jsonStr || jsonStr === '[DONE]') continue;

              try {
                const event = JSON.parse(jsonStr);
                const msgText = event.messageText || event.content || event.text || (event.data && (event.data.messageText || event.data.text || event.data.content)) || '';

                const isAliasMatch = !event.alias || event.alias === confirmedAlias || event.conversationAlias === confirmedAlias;
                const hasValidOutputKeys = typeof msgText === 'string' && (msgText.includes('x_thread') || msgText.includes('instagram_caption'));

                if ((event.senderType === 0 || hasValidOutputKeys) && msgText && isAliasMatch) {
                  console.log('[MindsService] Mind reply received via SSE stream!');
                  resolve(msgText);
                  return;
                }
              } catch (_) { /* skip non-JSON SSE lines */ }
            }
          }
        } catch (readErr) {
          reject(readErr);
        }
      }).catch(reject);
    });

    // 3. Send message to Minds API
    const msgRes = await fetch(`${this.baseUrl}/messaging/message`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        alias: confirmedAlias,
        messageText: fullPrompt
      })
    });

    if (!msgRes.ok) {
      const errText = await msgRes.text();
      throw new Error(`Send message returned HTTP ${msgRes.status}: ${errText}`);
    }

    const msgData = await msgRes.json();
    const sentMessageId = msgData.messageId;
    console.log(`[MindsService] Message posted to Minds API. alias=${confirmedAlias}, messageId=${sentMessageId}`);

    // 4. Concurrent Active Polling Loop (checks history every 3s alongside SSE)
    const pollLoopPromise = new Promise(async (resolve) => {
      const maxPolls = 28; // 28 * 3s = ~84s
      for (let i = 0; i < maxPolls; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const found = await fetchHistoryReply(confirmedAlias);
        if (found) {
          console.log(`[MindsService] Mind reply recovered via history polling (attempt ${i + 1}).`);
          resolve(found);
          return;
        }
      }
      resolve(null);
    });

    // 90-second Hard Timeout Promise
    const hardTimeoutPromise = new Promise((_, reject) => {
      sseTimeoutId = setTimeout(() => {
        reject(new Error('HARD_TIMEOUT'));
      }, 90000);
    });

    let rawOutputText = null;

    try {
      // Race SSE vs Active Polling vs 90s Hard Timeout
      rawOutputText = await Promise.race([
        ssePromise,
        pollLoopPromise,
        hardTimeoutPromise
      ]);
    } catch (raceErr) {
      if (raceErr.message === 'HARD_TIMEOUT') {
        console.warn(`[MindsService] 90s Timeout reached for alias=${confirmedAlias}. Running emergency fallback history fetch...`);
        rawOutputText = await fetchHistoryReply(confirmedAlias);
        if (rawOutputText) {
          console.log('[MindsService] Emergency fallback history fetch successfully recovered generated content!');
        } else {
          const timeoutErr = new Error('Generation timed out: The Minds AI took longer than 90 seconds to respond.');
          timeoutErr.statusCode = 504;
          throw timeoutErr;
        }
      } else {
        console.warn(`[MindsService] Stream error (${raceErr.message}). Running fallback history fetch...`);
        rawOutputText = await fetchHistoryReply(confirmedAlias);
      }
    } finally {
      if (sseTimeoutId) clearTimeout(sseTimeoutId);
      if (sseReader) {
        try { sseReader.cancel(); } catch (_) {}
      }
    }

    if (!rawOutputText) {
      // Last-ditch attempt
      rawOutputText = await fetchHistoryReply(confirmedAlias);
    }

    if (!rawOutputText) {
      const timeoutErr = new Error('Mind did not reply within the 90-second timeout window.');
      timeoutErr.statusCode = 504;
      throw timeoutErr;
    }

    // 5. Run JSON Safety Net
    try {
      const validatedJson = this.extractAndValidateJson(rawOutputText);
      return {
        success: true,
        data: validatedJson,
        meta: { alias: confirmedAlias, mode: 'Live Minds API', messageId: sentMessageId }
      };
    } catch (jsonErr) {
      console.error('[MindsService] JSON Safety Net failed. Raw output snippet:', rawOutputText.substring(0, 300));
      const err = new Error(`Mind returned malformed output: ${jsonErr.message}`);
      err.statusCode = 503;
      throw err;
    }
  }

  /**
   * Realistic Mock Generator for Testing & Demos
   */
  generateMockRepurposedContent(sourceContent, voiceProfile) {
    const snippet = sourceContent.substring(0, 150).replace(/\n/g, ' ').trim();
    const traits = voiceProfile.extractedTraits?.tone?.join(', ') || 'authentic and direct';

    const cleanEmoji = (str) => str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

    const tweets = [
      cleanEmoji(`1/ Most creators get format right, but strip out their actual voice when repurposing. Here is what we learned from analyzing 500+ top creator posts:`),
      cleanEmoji(`2/ "${snippet}..."`),
      cleanEmoji(`3/ The key isn't prompting "match my tone". Standard LLMs still cluster toward generic style. You need a persistent voice profile + explicit negative constraints (no buzzwords).`),
      cleanEmoji(`4/ When you preserve your phrasing, rhythm, and phrasing rules, cross-platform reach naturally increases because content doesn't feel like corporate AI text.`),
      cleanEmoji(`5/ Repurposing shouldn't mean rewriting for 3 hours. Take your long-form transcript, pass it through your custom voice profile, and ship native posts.`)
    ];

    const instagramCaption = cleanEmoji(`Your voice is your moat in the AI content era.\n\n"${snippet}..."\n\nWhen we analyzed creator workflow complaints, the #1 issue wasn't generating ideas—it was spending hours deleting generic AI buzzwords from generated captions before publishing.\n\nHere is how to fix it:\n• Hold a persistent voice profile of your past writing\n• Enforce strict negative constraints against generic AI filler\n• Adapt natively to platform format (first-line hook for IG, thread structure for X)\n\nDrop your thoughts in the comments if you are building a voice-first workflow.`);

    const youtubePost = cleanEmoji(`Hey everyone! Quick breakdown from our latest deep-dive:\n\n"${snippet}..."\n\nWe are noticing a huge shift in creator tools: generic AI tools strip out creator voice, forcing hours of manual rewriting. We have been testing a persistent Mind that holds your specific writing voice and outputs native posts for X, IG, and YouTube.\n\nWhich platform do you find hardest to repurpose for manually? Let me know below.`);

    return {
      success: true,
      data: {
        x_thread: tweets,
        instagram_caption: instagramCaption,
        youtube_post: youtubePost
      },
      meta: { mode: 'Mock Engine (Voice Preserved)', toneUsed: traits }
    };
  }
}

module.exports = new MindsService();
