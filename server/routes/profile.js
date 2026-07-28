const express = require('express');
const router = express.Router();
const VoiceProfile = require('../models/VoiceProfile');

const { DEFAULT_PERSONAS } = require('../services/personaSeeder');

const DEFAULT_USER_ID = 'default-creator';

// Helper function to get or initialize a VoiceProfile
async function getOrCreateProfile(userId = DEFAULT_USER_ID) {
  let profile = await VoiceProfile.findOne({ userId });
  if (!profile) {
    const seedMatch = DEFAULT_PERSONAS.find(p => p.userId === userId);
    if (seedMatch) {
      profile = new VoiceProfile(seedMatch);
    } else {
      profile = new VoiceProfile({
        userId,
        rawSamples: [
          "Stop trying to post everywhere at once without fixing your tone first. If your caption sounds like a press release, nobody is reading past line one.",
          "The best content strategy isn't creating 100 new ideas. It's taking one high-signal podcast episode and adapting it natively to 3 platforms without losing your voice."
        ],
        extractedTraits: {
          tone: ['Direct', 'High-signal', 'Punchy', 'Authentic'],
          sentenceLength: 'Short to medium, rhythmic',
          formattingStyle: 'Clean line breaks, bullet lists for key points',
          keyPhrases: ['high-signal', 'without losing your voice', 'natively']
        }
      });
    }
    await profile.save();
  }
  return profile;
}

// GET /api/profile - Fetch creator profile
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'] || DEFAULT_USER_ID;
    const profile = await getOrCreateProfile(userId);
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/profile/onboarding - Save initial writing samples
router.post('/onboarding', async (req, res) => {
  try {
    const userId = req.body.userId || req.headers['x-user-id'] || DEFAULT_USER_ID;
    const { samples } = req.body;
    if (!Array.isArray(samples) || samples.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide at least 1 writing sample.' });
    }

    const profile = await getOrCreateProfile(userId);
    profile.rawSamples = samples.filter(s => typeof s === 'string' && s.trim().length > 0);

    // Extract quick traits from samples
    const sampleText = profile.rawSamples.join(' ');
    const tones = [];
    if (sampleText.includes('!') || sampleText.match(/\b(build|ship|run|stop)\b/i)) tones.push('Action-oriented');
    if (sampleText.match(/\b(learned|insights|data|strategy)\b/i)) tones.push('Insightful');
    if (sampleText.match(/\b(you|your|we)\b/i)) tones.push('Direct & Conversational');
    if (tones.length === 0) tones.push('Authentic', 'Clear');

    profile.extractedTraits.tone = tones;
    await profile.save();

    res.json({ success: true, profile, message: 'Voice profile successfully initialized!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/profile/kill-list - Modify forbidden words kill list
router.put('/kill-list', async (req, res) => {
  try {
    const userId = req.body.userId || req.headers['x-user-id'] || DEFAULT_USER_ID;
    const { killList } = req.body;
    if (!Array.isArray(killList)) {
      return res.status(400).json({ success: false, error: 'killList must be an array of strings.' });
    }

    const profile = await getOrCreateProfile(userId);
    profile.killList = killList.map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
    await profile.save();

    res.json({ success: true, killList: profile.killList });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/profile/corrections - Add a new learned correction rule
router.post('/corrections', async (req, res) => {
  try {
    const userId = req.body.userId || req.headers['x-user-id'] || DEFAULT_USER_ID;
    const { correctionText, learnedRule, rule } = req.body;
    const ruleToAdd = (correctionText || learnedRule || rule || '').trim();

    if (!ruleToAdd) {
      return res.status(400).json({ success: false, error: 'correctionText is required.' });
    }

    const profile = await getOrCreateProfile(userId);
    profile.corrections.push(ruleToAdd);
    await profile.save();

    res.json({ success: true, corrections: profile.corrections, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/profile/corrections/:index - Delete a learned rule by index
router.delete('/corrections/:index', async (req, res) => {
  try {
    const userId = req.query.userId || req.body?.userId || req.headers['x-user-id'] || DEFAULT_USER_ID;
    const idx = parseInt(req.params.index, 10);
    const profile = await getOrCreateProfile(userId);

    if (!isNaN(idx) && idx >= 0 && idx < profile.corrections.length) {
      profile.corrections.splice(idx, 1);
      await profile.save();
    }

    res.json({ success: true, corrections: profile.corrections, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
