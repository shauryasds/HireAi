
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "" });
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/job/view/${jobId}`);
        if (!res.ok) throw new Error("Failed to fetch job details.");
        const data = await res.json();
        setJob(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch job details.");
        console.error("Job fetch error:", err);
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/interview/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          candidateName: form.name,
          candidateEmail: form.email,
        }),
      });

      if (!res.ok) throw new Error("Failed to start interview");

      const data = await res.json();
      // Store questions for the interview page
      localStorage.setItem(`interview_${data.interviewId}`, JSON.stringify(data.questions));
      navigate(`/interview/${data.interviewId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to start interview. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-yellow-400 font-semibold text-lg animate-pulse">
        Loading job details...
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-center px-4">
        <div className="text-red-500 font-semibold text-lg mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-24 font-inter">
      <div className="bg-[#111] border border-yellow-500/20 shadow-yellow-200/10 shadow-lg rounded-2xl p-10 w-full max-w-2xl text-white">
        <h1 className="text-3xl font-extrabold text-yellow-400 mb-2 text-center">
          {job.title} @ {job.company}
        </h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          Location: {job.location} | Type: {job.type} | Salary: {job.salaryRange?.min}–{job.salaryRange?.max} {job.salaryRange?.currency}
        </p>
        <p className="text-sm text-gray-400 text-center mb-8">
          {job.description}
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">Skills Required:</h3>
          <div className="flex flex-wrap gap-2">
            {job.skillsRequired?.map((skill, index) => (
              <span key={index} className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        <p className="text-xl font-bold mt-8 bg-yellow-500 w-1/2 m-auto rounded-lg text-black p-6 text-center mb-8">
          Attend Technical Interview Now :-
        </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 text-sm text-yellow-400 font-semibold">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full bg-black text-white border border-yellow-400/40 rounded-xl px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition disabled:opacity-50"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-yellow-400 font-semibold">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-black text-white border border-yellow-400/40 rounded-xl px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition disabled:opacity-50"
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-full hover:bg-yellow-300 transition-all duration-300 shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Starting Interview..." : "Start Interview"}
          </button>
        </form>
      </div>
    </div>
  );
}
