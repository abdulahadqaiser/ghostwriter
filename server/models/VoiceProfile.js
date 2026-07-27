const mongoose = require('mongoose');

// ─── CorrectionSchema ─────────────────────────────────────────────────────────
const CorrectionSchema = new mongoose.Schema({
  id:            { type: String, required: true },
  platform:      { type: String, required: true, enum: ['x_thread', 'instagram_caption', 'youtube_post'] },
  originalText:  { type: String, required: true },
  correctedText: { type: String, required: true },
  learnedRule:   { type: String, default: '' },
  createdAt:     { type: Date,   default: Date.now }
});

// ─── VoiceProfileSchema ───────────────────────────────────────────────────────
const VoiceProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // TASK 3: rawSamples — enforce per-item maxlength of 10,000 chars.
  // Each writing sample is stored individually; total samples capped at 10.
  rawSamples: {
    type: [String],
    validate: [
      {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: 'A voice profile can have at most 10 raw writing samples.'
      },
      {
        validator: function (arr) {
          return arr.every(s => typeof s === 'string' && s.length <= 10000);
        },
        message: 'Each writing sample must be 10,000 characters or fewer.'
      }
    ],
    default: []
  },

  extractedTraits: {
    tone:             [{ type: String }],
    sentenceLength:   { type: String, default: 'Varied, punchy' },
    formattingStyle:  { type: String, default: 'Short paragraphs, clean line breaks' },
    keyPhrases:       [{ type: String }]
  },

  killList: {
    type: [String],
    default: [
      'delve', 'tapestry', 'unlock', 'unleash', 'vibrant', 'testament',
      'leverage', 'synergy', 'game-changer', 'crucial', 'meticulous',
      'robust', 'cutting-edge', 'paradigm', 'revolutionize', 'moreover',
      'furthermore', 'subsequently', 'in conclusion', 'to summarize'
    ]
  },

  // TASK 3: corrections — enforce max 20 entries via custom validator.
  // Stored as Mixed to support both the legacy string format and the
  // structured CorrectionSchema objects used by the correction loop.
  corrections: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 20;
      },
      message: 'Voice profile corrections are capped at 20 entries. Remove old ones to add new corrections.'
    }
  },

  mindsConversationId: { type: String, default: null },

  equippedSkills: [{
    skillId:    String,
    name:       String,
    equippedAt: { type: Date, default: Date.now }
  }],

  updatedAt: { type: Date, default: Date.now }
});

// Auto-update updatedAt on every save
VoiceProfileSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('VoiceProfile', VoiceProfileSchema);
