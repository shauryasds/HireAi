import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "candidate",
  });

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
// console.log(import.meta.env.VITE_BACKEND_API_URL)
  const handleSubmit = async (e) => {
      
      e.preventDefault();
    //   console.log("Form data: from signup ", form)
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
// console.log(res)
      if (res.ok) {
        alert("Signup successful!");
        navigate("/login");
      } else {
        const data = await res.json();
        alert(data.error || "Signup failed");
      }
    } catch (err) {
      alert("Error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-20 font-inter">
      <div className="bg-[#111] border border-yellow-500/20 rounded-2xl p-10 w-full max-w-md text-white">
        <h2 className="text-3xl font-extrabold text-yellow-400 mb-6 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            className="w-full bg-black text-white border border-yellow-400/40 rounded-xl px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-black text-white border border-yellow-400/40 rounded-xl px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full bg-black text-white border border-yellow-400/40 rounded-xl px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full bg-black text-white border border-yellow-400/40 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="candidate">Candidate</option>
            <option value="recruiter">Recruiter</option>
          </select>
          <button
            type="submit"
            className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-full hover:bg-yellow-300 transition-all"
          >
            Create Account
          </button>
        </form>
        <p className="text-sm text-gray-400 text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-yellow-400 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
