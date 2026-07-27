const mongoose = require('mongoose');

const CorrectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  platform: { type: String, required: true, enum: ['x_thread', 'instagram_caption', 'youtube_post'] },
  originalText: { type: String, required: true },
  correctedText: { type: String, required: true },
  learnedRule: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const VoiceProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  rawSamples: [{ type: String }],
  extractedTraits: {
    tone: [{ type: String }],
    sentenceLength: { type: String, default: 'Varied, punchy' },
    formattingStyle: { type: String, default: 'Short paragraphs, clean line breaks' },
    keyPhrases: [{ type: String }]
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
  corrections: [CorrectionSchema],
  mindsConversationId: { type: String, default: null },
  equippedSkills: [{ 
    skillId: String, 
    name: String, 
    equippedAt: { type: Date, default: Date.now } 
  }],
  updatedAt: { type: Date, default: Date.now }
});

VoiceProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('VoiceProfile', VoiceProfileSchema);
