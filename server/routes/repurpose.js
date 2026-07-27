const express = require('express');
const router = express.Router();
const VoiceProfile = require('../models/VoiceProfile');
const mindsService = require('../services/mindsService');

const DEFAULT_USER_ID = 'default-creator';

// POST /api/repurpose - Main repurposing endpoint
router.post('/', async (req, res) => {
  try {
    const { sourceContent } = req.body;

    if (!sourceContent || typeof sourceContent !== 'string' || !sourceContent.trim()) {
      return res.status(400).json({ success: false, error: 'Source content text is required.' });
    }

    // Retrieve creator voice profile from MongoDB (Section 3: App owns memory safety net)
    let profile = await VoiceProfile.findOne({ userId: DEFAULT_USER_ID });
    if (!profile) {
      profile = new VoiceProfile({ userId: DEFAULT_USER_ID });
      await profile.save();
    }

    console.log(`[Repurpose API] Processing repurposing request for user: ${DEFAULT_USER_ID}`);

    // Call Minds Service with voice profile + source text
    const result = await mindsService.generateRepurposedContent(profile, sourceContent.trim());

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
