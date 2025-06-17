function Pricing() {
    const plans = [
      {
        title: "Starter",
        price: "Free",
        features: [
          "Create 2 Jobs",
          "Basic Resume Screening",
          "Email Notifications",
        ],
        highlight: false,
      },
      {
        title: "Pro",
        price: "$49/mo",
        features: [
          "Unlimited Job Posts",
          "AI Resume Analysis",
          "Automated Interviews",
          "Detailed Reports",
        ],
        highlight: true,
      },
      {
        title: "Enterprise",
        price: "Contact Us",
        features: [
          "Custom Integrations",
          "White-labeling",
          "Priority Support",
          "Advanced AI Analytics",
        ],
        highlight: false,
      },
    ];
  
    return (
      <section className="relative bg-black py-44 px-6 font-inter overflow-hidden">
        {/* Glowing Yellow Parallax Lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-gradient-radial from-yellow-400/10 via-yellow-300/5 to-transparent animate-pulse blur-3xl z-0 pointer-events-none" />
  
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Choose Your <span className="text-yellow-400">HireAI</span> Plan
          </h2>
          <p className="text-lg text-gray-400 mb-20">
            Transparent pricing. AI-powered hiring. No surprises.
          </p>
  
          <div className="grid md:grid-cols-3 gap-10 z-10">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-[2rem] border-2 backdrop-blur-sm ${
                  plan.highlight
                    ? "border-yellow-400 bg-yellow-100/5 shadow-yellow-200"
                    : "border-gray-700 bg-white/5 shadow-sm"
                } p-10 pt-14 min-h-[500px] flex flex-col justify-between transition-transform transform hover:scale-[1.03] hover:shadow-2xl duration-300`}
              >
                {plan.highlight && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-4 py-1 rounded-full shadow">
                    Best Value
                  </div>
                )}
  
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {plan.title}
                  </h3>
                  <p
                    className={`text-4xl font-extrabold mb-6 ${
                      plan.highlight ? "text-yellow-400" : "text-white"
                    }`}
                  >
                    {plan.price}
                  </p>
                  <ul className="space-y-4 text-gray-300 text-sm text-left">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="text-yellow-400 text-lg font-bold">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
  
                <button
                  className={`mt-10 w-full py-3 px-6 rounded-full text-base font-semibold transition duration-300 ${
                    plan.highlight
                      ? "bg-yellow-400 text-black hover:bg-yellow-300"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {plan.highlight ? "Get Pro" : "Choose Plan"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  export default Pricing;
  