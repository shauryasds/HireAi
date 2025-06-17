const mongoose = require('mongoose');
const { Schema } = mongoose;

const interviewSchema = new Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },

  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },

  questions: [{
    question: String,
    answer: String,
    score: Number,
  }],

  totalScore: Number,

  startedAt: Date,
  completedAt: Date,
});

module.exports = mongoose.model('Interview', interviewSchema);
