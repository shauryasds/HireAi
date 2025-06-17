const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    required: true,
  },

  company: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'contract', 'freelance', 'remote'],
    default: 'full-time',
  },

  salaryRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }, // or USD, etc.
  },

  skillsRequired: [
    {
      type: String,
      trim: true,
      lowercase: true,
    }
  ],

  experienceRequired: {
    type: String, // e.g., "2+ years", or range-based
    default: '0+ years',
  },

  education: {
    type: String,
    default: 'Not specified',
  },

  deadline: {
    type: Date,
    default: null,
  },

  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

  isActive: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Job', jobSchema);
