
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Report() {
  const { interviewId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/interview/report/${interviewId}`);
        if (!res.ok) throw new Error("Failed to fetch report");
        
        const data = await res.json();
        setReport(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch report");
        console.error("Report fetch error:", err);
        setLoading(false);
      }
    };
    fetchReport();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-yellow-400 font-semibold text-lg animate-pulse">
        Loading report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-500 font-semibold text-lg">
        {error}
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Average";
    return "Needs Improvement";
  };

  return (
    <div className="min-h-screen bg-black py-10 px-4 font-inter">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#111] border border-yellow-500/20 shadow-yellow-200/10 shadow-lg rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">Interview Report</h1>
            <p className="text-gray-400">Candidate: {report.candidateName}</p>
            <p className="text-gray-400">Email: {report.candidateEmail}</p>
            <p className="text-gray-400">Position: {report.job?.title}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-black/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Overall Score</h3>
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(report.totalScore)}`}>
                  {report.totalScore}/50
                </div>
                <p className={`text-lg font-semibold mt-2 ${getScoreColor(report.totalScore)}`}>
                  {getScoreLabel(report.totalScore)}
                </p>
              </div>
            </div>

            <div className="bg-black/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">Interview Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Started:</span> {new Date(report.startedAt).toLocaleString()}</p>
                <p><span className="text-gray-400">Completed:</span> {new Date(report.completedAt).toLocaleString()}</p>
                <p><span className="text-gray-400">Duration:</span> {Math.round((new Date(report.completedAt) - new Date(report.startedAt)) / 60000)} minutes</p>
                <p><span className="text-gray-400">Status:</span> 
                  <span className="text-green-400 ml-1 capitalize">{report.status}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-yellow-400 mb-6">Question-wise Analysis</h3>
            <div className="space-y-4">
              {report.questions?.map((q, index) => (
                <div key={index} className="bg-black/50 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-white flex-1">
                      Q{index + 1}: {q.question}
                    </h4>
                    <span className={`font-bold text-lg ${getScoreColor(q.score)}`}>
                      {q.score}/10
                    </span>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {q.answer || "No answer provided"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => window.print()}
              className="bg-yellow-400 text-black font-semibold px-8 py-3 rounded-full hover:bg-yellow-300 transition-all duration-300"
            >
              Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
