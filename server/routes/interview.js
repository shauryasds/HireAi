const express = require('express');
const router = express.Router();
const Interview = require('../Schema/InterviewSchema');
const Job = require('../Schema/JobSchema');
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Start interview for anonymous candidate
router.post('/start', async (req, res) => {
  try {
    const { jobId, candidateName, candidateEmail } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Generate interview questions based on job
    const prompt = `Generate 5 interview questions for a ${job.title} position requiring skills: ${job.skillsRequired.join(', ')}. 
    Return ONLY a JSON array of strings, no extra text:
    ["question1", "question2", "question3", "question4", "question5"]`;

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash", // or "gemini-2.0-pro", based on access
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
        "Tell me about yourself and your experience",
        "Why are you interested in this position?",
        "What are your key strengths?",
        "Describe a challenging project you worked on",
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
    const prompt = `Score the following answer to the question "${interview.questions}" on a scale of 0 to 100 based on relevance, clarity, and depth:\n\nAnswer: "${answers}"\n\n you have do strict marking each question holds equal weight .Return ONLY a number between 0 and 100.`;
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash", // or "gemini-2.0-pro", based on access
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    let score;
    try {
      const textOutput = result.text;
      console.log(textOutput)
      score = parseFloat(textOutput.trim());
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

    interview.questions = scoredQuestions;
    interview.totalScore = Math.round(score);
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

module.exports = router;