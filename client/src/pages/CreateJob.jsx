import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateJobMinimal() {
  const [form, setForm] = useState({
    title: "",
    company: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/job/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || err.message}`);
        return;
      }

      const data = await res.json();
      
      alert(`Job Created Successfully! 🎉\n\n Job Link will be genrated in My Jobs`);

      navigate("/my-jobs");
    } catch (err) {
      console.error("Job creation error:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-20 font-inter">
      <div className="bg-[#111] border border-yellow-500/20 rounded-2xl p-10 w-full max-w-xl text-white">
        <h1 className="text-3xl font-extrabold text-yellow-400 mb-6 text-center">Quick Job Create</h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          Just give us the essentials. We'll do the rest with AI.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Job Title"
            name="title"
            placeholder="e.g. React Developer"
            value={form.title}
            onChange={handleChange}
            disabled={loading}
          />

          <Input
            label="Company Name"
            name="company"
            placeholder="e.g. NimankIT or Confidential"
            value={form.company}
            onChange={handleChange}
            disabled={loading}
          />

          <Textarea
            label="Job Description"
            name="description"
            placeholder="Include skills, experience, job type, location, salary, etc. in natural language"
            value={form.description}
            onChange={handleChange}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-full hover:bg-yellow-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Job..." : "Submit & Let AI Handle It"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, disabled, ...props }) {
  return (
    <div className="w-full">
      <label className="block mb-1 text-sm text-yellow-400 font-semibold">{label}</label>
      <input
        {...props}
        disabled={disabled}
        className="w-full bg-black text-white border border-yellow-400/40 rounded-xl px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition disabled:opacity-50"
        required
      />
    </div>
  );
}

function Textarea({ label, disabled, ...props }) {
  return (
    <div className="w-full">
      <label className="block mb-1 text-sm text-yellow-400 font-semibold">{label}</label>
      <textarea
        {...props}
        rows={6}
        disabled={disabled}
        className="w-full bg-black text-white border border-yellow-400/40 rounded-xl px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition disabled:opacity-50 resize-none"
        required
      />
    </div>
  );
}
