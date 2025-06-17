// Simulated AI shortlisting logic based on interview performance
module.exports = async function shortlistAI(interviews, job) {
  // Select candidates based on interview scores (mock logic)
  const selectedCandidates = interviews
    .filter(interview => interview.totalScore >= 60) // candidates with 60+ score
    .sort((a, b) => b.totalScore - a.totalScore) // sort by highest score
    .slice(0, Math.ceil(interviews.length * 0.5)) // top 50% of candidates
    .map(interview => ({
      candidateName: interview.candidateName,
      candidateEmail: interview.candidateEmail,
      totalScore: interview.totalScore,
      interviewId: interview._id
    }));

  return { selectedCandidates };
};
