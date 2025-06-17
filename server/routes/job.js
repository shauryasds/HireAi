// routes/job.js
const express = require('express');
const router = express.Router();
const Job = require('../Schema/JobSchema');
const auth = require('../middleware/auth');
const  { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Post a new job (recruiters only)
router.post('/post', auth, async (req, res) => {
  if (req.user.role !== 'recruiter') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const { title, skills, experience, jobType } = req.body;

    const prompt = `
You are an expert technical recruiter assistant.

Given the following inputs from a recruiter:

- title: ${title}
- skills: ${skills}
- experience: ${experience}
- jobType: ${jobType}

Use this to generate a job posting JSON that strictly follows this schema:

{
  "title": string,
  "description": string (3–4 lines),
  "company": string (use "Confidential" or a generic name),
  "location": string (use "Remote" if not specified),
  "type": string (must match jobType exactly),
  "salaryRange": {
    "min": number (reasonable lower bound in INR),
    "max": number (reasonable upper bound in INR),
    "currency": "INR"
  },
  "skillsRequired": array of lowercase trimmed strings based on provided skills,
  "experienceRequired": string (same as exsperience),
  "education": string (default to "Not specified"),
  "deadline": null,
  "recruiter": "mock_recruiter_id_placeholder",
  "applicants": [],
  "isActive": true,
  "createdAt": current ISO datetime string
}

Only return a valid JSON object. No explanation or extra text or backticks nothing just an object without any enclosing string ''' jsut an object like 
{
  ...rest of data here
}.
`;

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash", // or "gemini-2.0-pro", based on access
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const textOutput = result.text;
    if (!textOutput) {
      return res.status(500).json({ error: "AI failed to generate job data." });
    }

    let cleanResponse = textOutput.trim();
    cleanResponse = cleanResponse.replace(/^```json\s*|\s*```$/g, '');
    
    console.log(cleanResponse)
    let jobData = JSON.parse(cleanResponse);
    // Replace placeholder with real recruiter ID
    jobData.recruiter = req.user.id;

    const newJob = new Job(jobData);
    await newJob.save();

    res.status(201).json({ message: "Job posted", job: newJob });
  } catch (err) {
    console.error("Job post error:", err);
    res.status(500).json({ error: "Failed to post job" });
  }
});

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Apply to a job (candidates only)
router.get('/apply/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    if (job.applicants.includes(req.user.id)) {
      return res.status(400).json({ error: 'Already applied' });
    }

    job.applicants.push(req.user.id);
    await job.save();
    res.json({ message: 'Applied successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to apply' });
  }
});
router.get('/view/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: 'Failed to Fetch' });
  }
});


// Apply to a job (candidates only)

module.exports = router;
