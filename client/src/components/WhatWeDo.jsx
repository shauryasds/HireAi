import { useState, useEffect } from "react";

const features = [
    {
      title: "Job Posting",
      desc: "AI-assisted JD creation with relevant skills & filters.",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 3h5v5M8 21H3v-5m13 5h5v-5M3 8V3h5"/></svg>`,
      angle: 0,
    },
    {
      title: "Skill Analysis",
      desc: "Instant filtering using AI scoring and keyword match.",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-6h6v6m-3-14a9 9 0 100 18 9 9 0 000-18z"/></svg>`,
      angle: 60,
    },
    {
      title: "AI Interviews",
      desc: "Voice-led interviews, monitored with face & voice tracking.",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13"/></svg>`,
      angle: 120,
    },
    {
      title: "Behavior Analysis",
      desc: "AI detects traits, confidence, and skill from responses.",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z"/></svg>`,
      angle: 180,
    },
    {
      title: "Proctoring",
      desc: "Track webcam, mic, and tab switch for interview integrity.",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 20h16v-2a8 8 0 00-16 0v2z"/></svg>`,
      angle: 240,
    },
    {
      title: "Final Reports",
      desc: "You get ranked, visual reports ready for decision.",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 11V3h2v8h3l-4 4-4-4h3zM5 21h14v-2H5v2z"/></svg>`,
      angle: 300,
    },
  ];
  
  

export default function WhatWeDoSection() {
  const [mounted, setMounted] = useState(false);
  const [visibleCards, setVisibleCards] = useState([]);

  useEffect(() => {
    setMounted(true);
    
    // Animate cards from left to right with stagger
    features.forEach((_, idx) => {
      setTimeout(() => {
        setVisibleCards(prev => [...prev, idx]);
      }, 800 + idx * 300);
    });
  }, []);

  // Responsive radius calculation
  const getRadius = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 140; // Mobile
      if (window.innerWidth < 1024) return 180; // Tablet
      return 220; // Desktop
    }
    return 220;
  };

  const [radius, setRadius] = useState(220);

  useEffect(() => {
    const handleResize = () => {
      setRadius(getRadius());
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="bg-black pt-0 text-white py-16 md:py-32 px-4 md:px-6 font-sans overflow-hidden min-h-screen flex items-center">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            What <span className="text-yellow-400">We Do</span>
          </h2>
          <p className="text-base md:text-lg text-gray-400 mt-4 max-w-xl mx-auto px-4">
            It's not just automation — it's intelligent hiring, at every step.
          </p>
        </div>

        {/* Orbit Container */}
        <div className="relative flex items-center justify-center">
          <div 
            className="relative"
            style={{ 
              height: `${radius * 2 + 200}px`,
              width: `${radius * 2 + 200}px`,
              maxHeight: '80vh',
              maxWidth: '100vw'
            }}
          >
            {/* Spinning orbit rings */}
            <div 
              className="absolute top-1/2 left-1/2 rounded-full border border-yellow-500/30"
              style={{
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                transform: 'translate(-50%, -50%)',
                animation: 'spin 25s linear infinite'
              }}
            />
            <div 
              className="absolute top-1/2 left-1/2 rounded-full border border-yellow-500/20"
              style={{
                width: `${radius * 2 + 40}px`,
                height: `${radius * 2 + 40}px`,
                transform: 'translate(-50%, -50%)',
                animation: 'spin 30s linear infinite reverse'
              }}
            />

            {/* Feature cards */}
            {features.map((item, idx) => {
              const angleRad = (item.angle * Math.PI) / 180;
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * radius;
              
              return (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    opacity: visibleCards.includes(idx) ? 1 : 0,
                    scale: visibleCards.includes(idx) ? 1 : 0.3,
                    transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transitionDelay: `${idx * 0.2}s`,
                  }}
                  className="group cursor-pointer"
                >
                  {/* Card container with modern circular design */}
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Main card */}
                    <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-white to-gray-100 rounded-full shadow-2xl flex flex-col items-center justify-center text-center p-3 md:p-4 lg:p-6 transform group-hover:scale-110 transition-all duration-500 group-hover:shadow-yellow-400/30">
                      
                      {/* Emoji with animation */}
                      <div className="text-2xl md:text-3xl lg:text-4xl mb-1 md:mb-2 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                      <div
  className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-yellow-500"
  dangerouslySetInnerHTML={{ __html: item.svg }}
/>

                        </div>
                      
                      {/* Title */}
                      <h3 className="text-xs md:text-sm lg:text-base font-bold text-gray-900 mb-1 leading-tight">
                        {item.title}
                      </h3>
                      
                      {/* Description - hidden on mobile, shown on hover */}
                      {/* <p className="text-xs text-gray-600 leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-x-2 bottom-2 hidden md:block lg:text-sm">
                        {item.desc.split(' ').slice(0, 4).join(' ')}...
                      </p> */}
                      
                      {/* Mobile description
                      <p className="text-xs text-gray-600 leading-tight md:hidden">
                        {item.desc.split(' ').slice(0, 3).join(' ')}...
                      </p> */}
                    </div>

                    {/* Floating accent */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 md:w-6 md:h-6 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-125" />
                  </div>
                </div>
              );
            })}

            {/* Center AI hub */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative group cursor-pointer">
                {/* Pulsing background */}
                <div className="absolute inset-0 bg-yellow-400 rounded-full animate-pulse scale-150 opacity-30" />
                
                {/* Main center hub */}
                <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-xl md:text-2xl lg:text-3xl font-bold text-black shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                  AI
                  
                  {/* Orbiting dots */}
                  <div className="absolute inset-0">
                    <div className="absolute w-2 h-2 bg-black rounded-full animate-ping" style={{
                      top: '-4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      animationDelay: '0s'
                    }} />
                    <div className="absolute w-2 h-2 bg-black rounded-full animate-ping" style={{
                      bottom: '-4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      animationDelay: '1s'
                    }} />
                    <div className="absolute w-2 h-2 bg-black rounded-full animate-ping" style={{
                      right: '-4px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      animationDelay: '2s'
                    }} />
                    <div className="absolute w-2 h-2 bg-black rounded-full animate-ping" style={{
                      left: '-4px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      animationDelay: '3s'
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </section>
  );
}