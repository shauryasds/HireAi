
import React from "react";

function Footer() {
  return (
    <footer className="bg-black text-gray-400 py-10 px-6 font-inter border-t border-gray-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
        <p className="text-center md:text-left ">
          © {new Date().getFullYear()}{" "}
          <span className="text-yellow-400 font-semibold">HireAI</span> — All rights reserved.
        </p>

        {/* Optional: Add socials or links if needed */}
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="hover:text-yellow-400 transition-colors duration-200"
          >
            Privacy
          </a>
          <a
            href="#"
            className="hover:text-yellow-400 transition-colors duration-200"
          >
            Terms
          </a>
          <a
            href="#"
            className="hover:text-yellow-400 transition-colors duration-200"
          >
            Contact
          </a>
        </div>
      </div>
      <div className="w-full p-8 text-center text-sm sm:text-xs md:text-base text-yellow-400 font-semibold px-4 py-2">
        Developed by — Shaurya Deep Shukla.
      </div>
    </footer>
  );
}

export default Footer;
