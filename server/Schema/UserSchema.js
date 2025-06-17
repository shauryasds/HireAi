const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  fullName: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 100,
    required: true,
  },

  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address'],
  },

  passwordHash: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ['candidate', 'recruiter'],
    default: 'candidate',
    required: true,
  },

  resumeUrl: {
    type: String,
    default: '',
  },

  appliedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  }],

  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
