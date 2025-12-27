const express = require('express');
const router = express.Router();
const Interview = require('../Schema/InterviewSchema');
const Job = require('../Schema/JobSchema');

const auth = require('../middleware/auth');
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Start interview for anonymous candidate
router.post('/start', async (req, res) => {
  try {
    const { jobId, candidateName, candidateEmail } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Generate interview questions based on job
    const prompt = `Generate 5 code based technical interview questions with the example code provided that reuire user to write the code  also the answer required  must be short and medium level difficulty   for a ${job.title} position requiring skills: ${job.skillsRequired.join(', ')}. 
    Return ONLY a JSON array of strings, no extra text:
    ["question1", "question2", "question3", "question4", "question5"]`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

   let questions;
    try {
      const textOutput = result.text;
      let cleanResponse = textOutput.trim();
      cleanResponse = cleanResponse.replace(/^```json\s*|\s*```$/g, '');
      // console.log(cleanResponse)
      questions = JSON.parse(cleanResponse);
    } catch (e) {
      // Fallback questions
      questions = [
        "Write a code to describe promise in js",
        "Is js single threaded or not ?",
        "What are props in js write basic code for it ?",
        "Describe the working of async await via code ",
        "Where do you see yourself in 5 years?"
      ];
    }

    const interview = new Interview({
      candidateName,
      candidateEmail,
      job: jobId,
      questions: questions.map(q => ({ question: q, answer: '', score: 0 })),
      status: 'pending',
      startedAt: new Date()
    });

    await interview.save();
    res.json({ interviewId: interview._id, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start interview' });
  }
});

// Submit interview answers
router.post('/submit/:interviewId', async (req, res) => {
  try {
    const { answers } = req.body;
    const interview = await Interview.findById(req.params.interviewId).populate('job');

    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    // Score answers using AI
    const scoredQuestions = [];
    const prompt = `Score the following answer to the question "${interview.questions}" on a scale of 0 to 100 based on relevance, clarity, and depth:\n\nAnswer: "${answers}"\n\n you have do strict marking each question holds equal weight .Return an array with ONLY a number between 0 and 100. and the short report about candidate explaing is he a good fit for the job or not. like [0,"Candidate is not a good fit due to lack of relevant experience."]`;
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    let score;
    let report ;
    try {
      let textOutput = result.text;
       textOutput = textOutput.trim();
      // console.log(textOutput.trim());
      textOutput = textOutput.replace(/^```json\s*|\s*```$/g, '');
    
      console.log(textOutput)
       textOutput = JSON.parse(textOutput);
      report=textOutput[1];
      score = parseFloat(textOutput[0]);
      console.log(report,"and ",score)
      if (isNaN(score) || score < 0 || score > 100) {
        score = 0; // Fallback to 0 if scoring fails
      }
    } catch (e) {
      score = 0; // Fallback to 0 if parsing fails
    }
    for (let i = 0; i < interview.questions.length; i++) {
      const question = interview.questions[i].question;
      const answer = answers[i] || '';

      
      scoredQuestions.push({
        question,
        answer
      });
    }
// console.log("report:",report)
    interview.questions = scoredQuestions;
    interview.totalScore = Math.round(score);
    interview.report = report;
    interview.status = 'completed';
    interview.completedAt = new Date();

    await interview.save();

    res.json({ 
      message: 'Interview submitted successfully',
      interviewId: interview._id,
      totalScore: interview.totalScore
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit interview' });
  }
});

// Get interview report
router.get('/report/:interviewId', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId).populate('job');
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    res.json(interview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Get all interviews for recruiter (protected route)
router.get('/all', auth, async (req, res) => {
  try {
    const decoded = req.user;

    // Ensure the user is a recruiter
    if (!decoded || decoded.role !== 'recruiter') {
      return res.status(403).json({ error: 'Unauthorized - Recruiter access required' });
    }

    // Fetch jobs posted by this recruiter
    const recruiterJobs = await Job.find({ recruiter: decoded.id }).select('_id');
    const jobIds = recruiterJobs.map(job => job._id);

    if (jobIds.length === 0) {
      return res.json([]); // No jobs, no interviews
    }

    // Fetch interviews linked to the recruiter's jobs
    const interviews = await Interview.find({ job:  jobIds  })
      .populate('job', 'title company')
      .sort({ startedAt: -1 });

    res.json(interviews);
  } catch (err) {
    console.error('Error fetching interviews:', err);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});


module.exports = router;
