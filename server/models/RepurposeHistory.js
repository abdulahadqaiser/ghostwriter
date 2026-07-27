const mongoose = require('mongoose');

const repurposeHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'default-creator',
    index: true
  },
  title: {
    type: String,
    required: true
  },
  sourceContent: {
    type: String,
    required: true
  },
  repurposedOutputs: {
    x_thread: [String],
    instagram_caption: String,
    youtube_post: String
  },
  meta: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RepurposeHistory', repurposeHistorySchema);
