import { motion } from "framer-motion";
import React from "react";
import Timeline from "../components/Timeline.jsx";
import Pricing from "../components/Pricing.jsx";
import Footer from "../components/Footer.jsx";
import CTA from "../components/Cta.jsx";
import WhatWeDoSection from "../components/WhatWeDo.jsx";

function Home() {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-center items-center min-h-[100vh] bg-black px-6 md:px-10 py-32 md:py-20 font-inter gap-10">
        {/* Left Section */}
        <div className="w-full md:w-1/2 md:pr-10 text-center md:text-left">
          <h2 className="text-5xl sm:text-6xl font-extrabold leading-tight text-white">
            THE <span className="text-yellow-400 text-6xl sm:text-7xl">AI</span>
          </h2>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mt-4">
            Hiring Solution
          </h2>
          <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-xl leading-relaxed mx-auto md:mx-0">
            Streamline your hiring process using artificial intelligence. From
            job creation to resume analysis, automated interviews, and detailed
            reports – everything is handled smartly and efficiently.<br/>
            <span className="text-yellow-400  ">Post a Job in  1-min And Let AI do the Work</span>

          </p>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-center relative h-[480px] sm:h-[520px]">
          {/* Nail */}
          <div className="w-3 h-3 rounded-full bg-yellow-400 mb-1 shadow-md z-10" />
          {/* String */}
          <div className="w-1 h-16 bg-gray-400 z-0" />

          {/* Swinging Card */}
          <motion.div
            className="w-[90vw] sm:w-[320px] bg-white text-gray-900 rounded-2xl shadow-2xl p-6 space-y-4 origin-top border border-gray-300"
            animate={{ rotate: [4, -4, 4] }}
            transition={{
              repeat: Infinity,
              duration: 2.5,
              ease: "easeInOut",
            }}
          >
            <div className="text-lg sm:text-xl font-bold text-center border-b pb-3 text-yellow-500">
              Hiring is expensive.<br />
              It costs <span className="text-black text-3xl">TIME</span>.
            </div>
            {[
              "Save Time",
              "Save your Resources",
              "Let AI do the Initial filtering and Interview",
              "Get the Report",
              "All Set.",
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm sm:text-base">
                <span className="text-yellow-400 font-bold">•</span>
                <span>{step}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      <WhatWeDoSection/>
      {/* <Pricing /> */}
      <CTA />
      <Timeline />
      <Footer />
    </>
  );
}

export default Home;
