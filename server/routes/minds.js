const express = require('express');
const router = express.Router();
const mindsService = require('../services/mindsService');

// GET /api/minds/status - Returns Mind status, Cognition Credits, and Bazaar skills
router.get('/status', async (req, res) => {
  try {
    const [mindDetails, credits, equippedSkills] = await Promise.all([
      mindsService.getMindDetails(),
      mindsService.getCreditsBalance(),
      mindsService.checkAndEquipRelevantSkills()
    ]);

    res.json({
      success: true,
      mind: mindDetails,
      credits,
      equippedSkills,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
