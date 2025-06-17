import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ApplyJob() {
  const { jobId } = useParams();
  const [form, setForm] = useState({ name: "", email: "" });
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
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

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          name: form.name,
          email: form.email,
        }),
      });

      const data = await res.json();
      console.log("Response:", data);
      alert("Application submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-yellow-400 font-semibold text-lg animate-pulse">
        Loading job details...
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

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-24 font-inter">
      <div className="bg-[#111] border border-yellow-500/20 shadow-yellow-200/10 shadow-lg rounded-2xl p-10 w-full max-w-2xl text-white">
        <h1 className="text-3xl font-extrabold text-yellow-400 mb-2 text-center">
          {job.title} @ {job.company}
        </h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          Location: {job.location} | Type: {job.type} | Salary: {job.salaryRange?.min}–{job.salaryRange?.max} {job.salaryRange?.currency}
        </p>
        <p className="text-sm text-gray-400 text-center mb-6">
          {job.description}
        </p>

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
              className="w-full bg-black text-white border border-yellow-400/40 rounded-xl px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              required
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
              className="w-full bg-black text-white border border-yellow-400/40 rounded-xl px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-full hover:bg-yellow-300 transition-all duration-300 shadow"
          >
            Attend Interview
          </button>
        </form>
      </div>
    </div>
  );
}
