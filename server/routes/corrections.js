const express = require('express');
const router = express.Router();
const VoiceProfile = require('../models/VoiceProfile');

const DEFAULT_USER_ID = 'default-creator';

// POST /api/corrections - Save creator edits and update voice profile context
router.post('/', async (req, res) => {
  try {
    const { platform, originalText, correctedText, learnedRule } = req.body;

    if (!platform || !originalText || !correctedText) {
      return res.status(400).json({ 
        success: false, 
        error: 'platform, originalText, and correctedText are required fields.' 
      });
    }

    let profile = await VoiceProfile.findOne({ userId: DEFAULT_USER_ID });
    if (!profile) {
      profile = new VoiceProfile({ userId: DEFAULT_USER_ID });
    }

    const newCorrection = {
      id: `corr-${Date.now()}`,
      platform,
      originalText: originalText.trim(),
      correctedText: correctedText.trim(),
      learnedRule: learnedRule?.trim() || `Creator edited ${platform} output for better voice fit.`,
      createdAt: new Date()
    };

    profile.corrections.push(newCorrection);

    // Keep up to 20 most recent corrections to avoid prompt ballooning
    if (profile.corrections.length > 20) {
      profile.corrections = profile.corrections.slice(-20);
    }

    await profile.save();

    console.log(`[Corrections API] Added new correction rule for ${platform}: "${newCorrection.learnedRule}"`);

    res.json({
      success: true,
      message: 'Correction saved! Future generations for your profile will apply this feedback.',
      correction: newCorrection,
      totalCorrections: profile.corrections.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
