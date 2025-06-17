const mongoose = require("mongoose");

const shortlistSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  selectedCandidates: [
    {
      candidateName: { type: String, required: true },
      candidateEmail: { type: String, required: true },
      totalScore: { type: Number, default: 0 },
      interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Shortlist", shortlistSchema);
