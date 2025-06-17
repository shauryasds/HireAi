import { useState } from "react";

export default function CreateJobMinimal() {
  const [form, setForm] = useState({
    title: "",
    skills: "",
    experience: "",
    jobType: "full-time",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const jobData = {
      ...form,
      skillsRequired: form.skills.split(",").map((s) => s.trim()),
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/job/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
        credentials: "include", 
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.message}`);
        console.log(err)
        return;
      }

      const data = await res.json();
      alert("Job Created! AI will handle the rest.");
      // Optionally redirect to: `/jobs/${data.id}`
    } catch (err) {
      console.error("Job creation error:", err);
      alert("Something went wrong.");
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
          />

          <Input
            label="Skills Required (comma separated)"
            name="skills"
            placeholder="e.g. React, Tailwind, REST API"
            value={form.skills}
            onChange={handleChange}
          />

          <Input
            label="Experience Level"
            name="experience"
            placeholder="e.g. 1+ years"
            value={form.experience}
            onChange={handleChange}
          />

          <div>
            <label className="block mb-1 text-sm text-yellow-400 font-semibold">Job Type</label>
            <select
              name="jobType"
              value={form.jobType}
              onChange={handleChange}
              className="w-full bg-black text-white border border-yellow-400/40 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
            >
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-full hover:bg-yellow-300 transition-all"
          >
            Submit & Let AI Handle It
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="w-full">
      <label className="block mb-1 text-sm text-yellow-400 font-semibold">{label}</label>
      <input
        {...props}
        className="w-full bg-black text-white border border-yellow-400/40 rounded-xl px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
        required
      />
    </div>
  );
}
