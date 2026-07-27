const express = require('express');
const router = express.Router();
const VoiceProfile = require('../models/VoiceProfile');

const DEFAULT_USER_ID = 'default-creator';

// POST /api/corrections - Save creator edits and update voice profile context
router.post('/', async (req, res) => {
  try {
    const { platform, originalText, correctedText, learnedRule, correctionText, rule } = req.body;

    const ruleText = correctionText || learnedRule || rule;

    // Handle simple rule string addition (e.g. { correctionText: "Never say the word 'Poll'" })
    if (ruleText && (!platform || !originalText || !correctedText)) {
      let profile = await VoiceProfile.findOne({ userId: DEFAULT_USER_ID });
      if (!profile) {
        profile = new VoiceProfile({ userId: DEFAULT_USER_ID });
      }
      profile.corrections.push(ruleText.trim());
      await profile.save();

      return res.json({
        success: true,
        message: 'Rule added to profile!',
        corrections: profile.corrections,
        profile
      });
    }

    if (!platform || !originalText || !correctedText) {
      return res.status(400).json({ 
        success: false, 
        error: 'platform, originalText, and correctedText (or correctionText) are required fields.' 
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
