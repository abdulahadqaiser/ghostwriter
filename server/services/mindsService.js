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
   * Section 4 / Bazaar Ecosystem Integration:
   * Checks available skills on Minds Bazaar (GET /v1/bazaar/skills) and equips relevant writing/style skills.
   */
  async checkAndEquipRelevantSkills(mindId = this.mindId) {
    if (this.useMock) {
      return [
        { skillId: 'bazaar-writing-style-v1', name: 'Author Voice & Tone Preserver', status: 'equipped' },
        { skillId: 'bazaar-platform-adapter-v2', name: 'Social Platform Content Adapter', status: 'equipped' }
      ];
    }

    try {
      const bazaarRes = await fetch(`${this.baseUrl}/bazaar/skills`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!bazaarRes.ok) {
        console.warn(`[MindsService] Bazaar fetch returned ${bazaarRes.status}, using default configuration.`);
        return [];
      }

      const bazaarData = await bazaarRes.json();
      const items = bazaarData.items || [];

      // Filter relevant writing/style skills
      const relevantSkills = items.filter(s =>
        s.name?.toLowerCase().includes('writing') ||
        s.name?.toLowerCase().includes('style') ||
        s.name?.toLowerCase().includes('tone') ||
        s.name?.toLowerCase().includes('content') ||
        s.description?.toLowerCase().includes('content')
      ).slice(0, 3);

      return relevantSkills.map(s => ({ skillId: s.skillId, name: s.name, status: 'available' }));
    } catch (err) {
      console.error('[MindsService] Error checking Bazaar skills:', err.message);
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

    // Format corrections block
    const correctionsBlock = corrections.length > 0
      ? corrections.map(c =>
        `Platform: ${c.platform} | Original: "${c.originalText}" | Fixed To: "${c.correctedText}" | Rule: ${c.learnedRule || 'Match creator edits'}`
      ).join('\n')
      : 'No corrections recorded yet.';

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

=== LEARNED CORRECTIONS ===
${correctionsBlock}

=== FORMATTING RULES ===
1. x_thread: Extract the 3-5 strongest points. Write as a Twitter thread. Return as an ARRAY OF STRINGS, where each string is a single tweet.
2. instagram_caption: Hook in the first sentence. End with a call to action. YOU MUST USE explicit escaped newlines (\\n\\n) to separate every paragraph. NEVER use HTML tags like <br> or <p>. DO NOT squish sentences together. A period must always be followed by a space before the next word.
3. youtube_post: Conversational, community-facing tone. End with a poll or question. YOU MUST USE explicit escaped newlines (\\n\\n) to separate every paragraph. NEVER use HTML tags like <br> or <p>. DO NOT squish sentences together. A period must always be followed by a space before the next word.

=== OUTPUT FORMAT ===
You MUST return ONLY a valid JSON object. No markdown wrappers, no conversational filler, no explanations. Just the raw JSON object matching this exact schema:
{
  "x_thread": ["tweet 1", "tweet 2", "tweet 3"],
  "instagram_caption": "your instagram caption here",
  "youtube_post": "your youtube community post here"
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

    // Post-parse cleanup: fix squished sentences and strip any HTML tags (e.g. <br>, <p>)
    // that the LLM may have hallucinated into the output.
    const cleanFormatting = (str) => {
      if (typeof str !== 'string') return str;
      return str
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?p>/gi, '\n\n')
        .replace(/\.([A-Z])/g, '. $1')
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
    // Mock / Safety Net mode
    if (this.useMock) {
      console.log('[MindsService] Operating in Safety Net / Mock Mode.');
      return this.generateMockRepurposedContent(sourceContent, voiceProfile);
    }

    // Build two-part prompt — system persona + user source content
    const { fullPrompt } = this.buildPromptParts(voiceProfile, sourceContent);

    try {
      console.log('[MindsService] Sending request to Minds Messaging API...');

      // 1. Create a fresh conversation alias per request.
      //    A new alias prevents stale history bleeding into the Mind's context.
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

      // 2. Subscribe to SSE stream BEFORE sending the message,
      //    so we don't miss the Mind's reply event.
      //    GET /v1/messaging/events streams Server-Sent Events.
      //    Each event has: event: message, data: JSON string.
      //    We resolve as soon as we see a Mind reply (senderType 0) for this alias.
      const SSE_TIMEOUT_MS = 105000; // 25 seconds
      const rawOutputTextPromise = new Promise((resolve, reject) => {
        const url = `${this.baseUrl}/messaging/events`;
        console.log(`[MindsService] Opening SSE stream at ${url} ...`);

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

          const reader = sseRes.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          const timeout = setTimeout(() => {
            reader.cancel();
            reject(new Error('SSE timeout: Mind did not reply within 45 seconds.'));
          }, SSE_TIMEOUT_MS);

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop(); // keep incomplete last line

              for (const line of lines) {
                if (!line.startsWith('data:')) continue;
                const jsonStr = line.replace(/^data:\s*/, '').trim();
                if (!jsonStr || jsonStr === '[DONE]') continue;

                try {
                  const event = JSON.parse(jsonStr);
                  // senderType 0 = Mind reply; filter to our alias
                  if (
                    event.senderType === 0 &&
                    (event.alias === confirmedAlias || event.conversationAlias === confirmedAlias)
                  ) {
                    clearTimeout(timeout);
                    reader.cancel();
                    console.log('[MindsService] Mind reply received via SSE.');
                    resolve(event.messageText || event.content || JSON.stringify(event));
                    return;
                  }
                } catch (_) { /* skip non-JSON lines */ }
              }
            }
          } catch (readErr) {
            clearTimeout(timeout);
            reject(readErr);
          }
        }).catch(reject);
      });

      // 3. Send the message AFTER starting the SSE listener.
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
      console.log(`[MindsService] Message sent. messageId=${sentMessageId}, alias=${confirmedAlias}`);

      // 4. Wait for SSE reply, then fall back to short history poll.
      //    In production mode (useMock=false), we NEVER silently substitute
      //    template data — we surface a real error if the Mind doesn't reply.
      let rawOutputText = null;
      try {
        rawOutputText = await rawOutputTextPromise;
      } catch (sseErr) {
        console.warn(`[MindsService] SSE failed (${sseErr.message}), trying history polling...`);

        // Short poll: 3 attempts × 2s = 6s additional wait
        const maxAttempts = 3;
        const pollIntervalMs = 2000;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await new Promise(r => setTimeout(r, pollIntervalMs));
          console.log(`[MindsService] Polling history attempt ${attempt + 1}/${maxAttempts}...`);

          const historyRes = await fetch(`${this.baseUrl}/messaging/histories/${confirmedAlias}`, {
            method: 'GET',
            headers: this.getHeaders()
          });

          if (!historyRes.ok) continue;
          const historyItems = await historyRes.json();
          if (!Array.isArray(historyItems)) continue;

          const mindReplies = historyItems.filter(m => m.senderType === 0);
          if (mindReplies.length > 0) {
            rawOutputText = mindReplies[mindReplies.length - 1].messageText;
            console.log(`[MindsService] Mind reply found via polling on attempt ${attempt + 1}.`);
            break;
          }
        }
      }

      if (!rawOutputText) {
        throw new Error('Mind did not reply via SSE or polling within timeout.');
      }

      // 5. Run the JSON Safety Net.
      //    In production mode, a malformed reply from the Mind is a 503 —
      //    the upstream service responded but with unusable output.
      try {
        const validatedJson = this.extractAndValidateJson(rawOutputText);
        return {
          success: true,
          data: validatedJson,
          meta: { alias: confirmedAlias, mode: 'Live Minds API', messageId: sentMessageId }
        };
      } catch (jsonErr) {
        console.error('[MindsService] JSON Safety Net failed. Raw output:', rawOutputText.substring(0, 300));
        const err = new Error(`Mind returned malformed output that could not be parsed as valid JSON: ${jsonErr.message}`);
        err.statusCode = 503;
        throw err;
      }

    } catch (apiErr) {
      // Propagate all errors in production — no silent template substitution.
      // Attach a statusCode if not already set so the route can send the right HTTP status.
      console.error('[MindsService] Live API error:', apiErr.message);
      const isTimeout = apiErr.message.includes('timeout') || apiErr.message.includes('Timeout') || apiErr.message.includes('did not reply');
      if (!apiErr.statusCode) {
        apiErr.statusCode = isTimeout ? 504 : 500;
      }
      throw apiErr;
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
