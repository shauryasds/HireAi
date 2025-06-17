// Simulated AI interview scoring
module.exports = async function interviewAI(candidateId, jobId, answers) {
    const score = Math.floor(Math.random() * 100); // mock scoring
    const feedback = 'AI Feedback: Good communication. Consider improving technical depth.';
  
    return {
      answers,
      score,
      feedback,
    };
  };
  