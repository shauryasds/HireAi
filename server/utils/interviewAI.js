
const generateQuestions = (jobTitle, jobDescription) => {
  const questions = [
    `Tell me about yourself and why you're interested in this ${jobTitle} position.`,
    `What experience do you have relevant to ${jobTitle}?`,
    `How would you handle a challenging situation in this role?`,
    `What are your strengths and how do they apply to this position?`,
    `Where do you see yourself in the next 5 years?`
  ];
  
  return questions;
};

const evaluateAnswers = (questions, answers) => {
  let totalScore = 0;
  const evaluation = questions.map((question, index) => {
    const answer = answers[index] || '';
    const score = Math.min(Math.max(answer.length / 50, 1), 10); // Basic scoring
    totalScore += score;
    
    return {
      question,
      answer,
      score: Math.round(score),
      feedback: generateFeedback(score)
    };
  });

  return {
    evaluation,
    totalScore: Math.round(totalScore),
    maxScore: questions.length * 10,
    percentage: Math.round((totalScore / (questions.length * 10)) * 100)
  };
};

const generateFeedback = (score) => {
  if (score >= 8) return 'Excellent response with good detail and relevance.';
  if (score >= 6) return 'Good response, could use more detail or examples.';
  if (score >= 4) return 'Adequate response, but lacks depth or clarity.';
  return 'Response needs improvement in detail and relevance.';
};

module.exports = {
  generateQuestions,
  evaluateAnswers
};
