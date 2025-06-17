
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

    const result = await ai.generateContent(prompt);
    let questions;
    try {
      const cleanResponse = result.response.text().trim().replace(/^```json\s*|\s*```$/g, '');
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
    let totalScore = 0;
    const scoredQuestions = [];

    for (let i = 0; i < interview.questions.length; i++) {
      const question = interview.questions[i].question;
      const answer = answers[i] || '';
      
      // Simple scoring for now
      let score = Math.min(answer.length / 10, 10); // Basic scoring based on answer length
      if (answer.length > 50) score = Math.min(score + 2, 10);
      
      scoredQuestions.push({
        question,
        answer,
        score: Math.round(score)
      });
      totalScore += score;
    }

    interview.questions = scoredQuestions;
    interview.totalScore = Math.round(totalScore);
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
