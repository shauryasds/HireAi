import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi"; // Optional: install `react-icons`

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-4 z-50 left-1/2 transform -translate-x-1/2 font-inter bg-black w-[90vw] max-w-6xl mx-auto rounded-xl shadow-md py-3 px-6">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-extrabold text-white select-none tracking-wider">
          Hire<span className="text-yellow-400">AI</span>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center space-x-10 text-white font-medium text-sm">
          <li>
            <Link
              to="/"
              className="hover:text-yellow-400 transition-colors duration-300"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/create-job"
              className="hover:text-yellow-400 transition-colors duration-300"
            >
              Create Job
            </Link>
          </li>
        </ul>

        {/* Login Button (Desktop) */}
        <Link to="/login">
          <button
            type="button"
            className="hidden md:block ml-4 px-5 py-2 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition-all duration-300 shadow"
          >
            Login
          </button>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="mt-4 md:hidden text-white font-medium text-sm space-y-4">
          <Link
            to="/"
            className="block hover:text-yellow-400 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/create-job"
            className="block hover:text-yellow-400 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Create Job
          </Link>
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
          >
            <button
              type="button"
              className="w-full mt-2 px-5 py-2 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition-all duration-300 shadow"
            >
              Login
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
