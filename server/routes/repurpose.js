const express = require('express');
const router = express.Router();
const VoiceProfile = require('../models/VoiceProfile');
const mindsService = require('../services/mindsService');

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

    // ── TASK 4: Input Validation ───────────────────────────────────────────
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

    const MAX_CHARS = 10000;
    if (trimmed.length > MAX_CHARS) {
      return res.status(400).json({
        success: false,
        error: `sourceContent exceeds the ${MAX_CHARS.toLocaleString()}-character limit (received ${trimmed.length.toLocaleString()} chars). The content has been chunked automatically — please use the frontend Extract button which handles large content.`
      });
    }

    // Retrieve creator voice profile from MongoDB (Section 3: App owns memory safety net)
    let profile = await VoiceProfile.findOne({ userId: DEFAULT_USER_ID });
    if (!profile) {
      profile = new VoiceProfile({ userId: DEFAULT_USER_ID });
      await profile.save();
    }

    console.log(`[Repurpose API] Processing repurposing request for user: ${DEFAULT_USER_ID}`);

    // Call Minds Service with voice profile + source text
    const result = await mindsService.generateRepurposedContent(profile, trimmed);

    // Save to history on successful generation
    if (result && result.success && result.data) {
      try {
        const title = generateTitle(trimmed);
        const historyRecord = await createHistoryEntry(title, trimmed, result.data, result.meta);
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
