const express = require('express');
const router = express.Router();
const RepurposeHistory = require('../models/RepurposeHistory');

const DEFAULT_USER_ID = 'default-creator';

// In-memory fallback if MongoDB connection is not active
let inMemoryHistory = [];

// Helper to check if Mongoose connection is ready
function isMongoConnected() {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
}

// Helper to save a history entry (used by repurpose route or direct endpoint)
async function createHistoryEntry(title, sourceContent, repurposedOutputs, meta = {}, userId = DEFAULT_USER_ID) {
  const entry = {
    userId: userId || DEFAULT_USER_ID,
    title: title || sourceContent.slice(0, 45).trim() + '...',
    sourceContent,
    repurposedOutputs,
    meta,
    createdAt: new Date()
  };

  if (isMongoConnected()) {
    const doc = new RepurposeHistory(entry);
    const saved = await doc.save();
    return saved;
  } else {
    const fakeId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const savedEntry = { ...entry, _id: fakeId };
    inMemoryHistory.unshift(savedEntry);
    return savedEntry;
  }
}

// GET /api/history - Get all past repurposes for the user
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'] || DEFAULT_USER_ID;
    if (isMongoConnected()) {
      const items = await RepurposeHistory.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50);
      return res.json({ success: true, history: items });
    } else {
      return res.json({ success: true, history: inMemoryHistory.filter(h => h.userId === userId) });
    }
  } catch (err) {
    console.error('[History API] Error fetching history:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/history/:id - Get a single past session
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      const item = await RepurposeHistory.findById(id);
      if (!item) return res.status(404).json({ success: false, error: 'History item not found.' });
      return res.json({ success: true, item });
    } else {
      const item = inMemoryHistory.find(i => String(i._id) === id);
      if (!item) return res.status(404).json({ success: false, error: 'History item not found.' });
      return res.json({ success: true, item });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/history/:id - Delete a past session
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      await RepurposeHistory.findByIdAndDelete(id);
    } else {
      inMemoryHistory = inMemoryHistory.filter(i => String(i._id) !== id);
    }
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/history - Clear all history
router.delete('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      await RepurposeHistory.deleteMany({ userId: DEFAULT_USER_ID });
    } else {
      inMemoryHistory = [];
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
module.exports.createHistoryEntry = createHistoryEntry;
