function Timeline() {
    const steps = [
      {
        title: "Create Job Instantly",
        desc: "Use AI-assisted job creation to auto-generate optimized job descriptions.",
      },
      
      {
        title: "Automated Interviews",
        desc: "AI conducts structured interviews and captures key behavioral insights.",
      },
      {
        title: "Instant Reports",
        desc: "Get a detailed, data-driven summary of every applicant automatically.",
      },
      {
        title: "Faster Hiring",
        desc: "Hire the best talent with minimal effort and maximum efficiency.",
      },
    ];
  
    return (
      <section className="bg-black py-24 px-6 font-inter">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-20">
            The <span className="text-yellow-400">HireAI</span> Timeline
          </h2>
  
          {/* Timeline Container */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-yellow-400 z-0" />
  
            {/* Timeline Steps */}
            <div className="space-y-16 relative z-10">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center text-center"
                >
                  {/* Dot */}
                  <div className="w-5 h-5 rounded-full bg-yellow-400 border-[4px] border-black z-10" />
  
                  {/* Card */}
                  <div className="mt-4 w-full md:w-1/2 bg-white/90 backdrop-blur-md border border-yellow-300 shadow-xl p-6 rounded-xl hover:scale-[1.02] transition-all">
                    <h3 className="text-xl font-bold text-black mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-700">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  export default Timeline;
  
  