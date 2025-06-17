// Simulated AI shortlisting logic
module.exports = async function shortlistAI(resumes, job) {
    // Just pick every second candidate as a mock
    const selectedCandidates = resumes
      .filter((resume, index) => index % 2 === 0)
      .map(r => r.candidate);
  
    return { selectedCandidates };
  };
  