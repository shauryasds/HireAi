
const mongoose = require('mongoose');
const { Schema } = mongoose;

const shortlistSchema = new Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },

  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  reason: {
    type: String,
    default: '',
  },

  aiScore: {
    type: Number,
  },

  shortlistedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Shortlist', shortlistSchema);
