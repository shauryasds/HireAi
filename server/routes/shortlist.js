// routes/shortlist.js
const express = require('express');
const router = express.Router();
const Resume = require('../Schema/ResumeSchema');
const Job = require('../Schema/JobSchema');
const Shortlist = require('../Schema/shortlistSchema');
const auth = require('../middleware/auth');
const shortlistAI = require('../utils/shortlistAI');

// Shortlist candidates for a job using AI
router.post('/:jobId', auth, async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const resumes = await Resume.find({});
    const results = await shortlistAI(resumes, job);

    const shortlist = new Shortlist({
      job: job._id,
      recruiter: req.user.id,
      selectedCandidates: results.selectedCandidates,
    });
    await shortlist.save();

    res.status(200).json({ message: 'Shortlisting complete', shortlist });
  } catch (err) {
    res.status(500).json({ error: 'Failed to shortlist candidates' });
  }
});

module.exports = router;
