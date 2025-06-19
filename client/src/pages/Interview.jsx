import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function Interview() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Monitoring states
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const codeEditorRef = useRef(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Timer functionality
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Enhanced fullscreen functionality - Skip on mobile
  const enterFullscreen = async () => {
    if (isMobile) {
      return true; // Skip fullscreen on mobile
    }

    try {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
        return true;
      } else if (containerRef.current?.webkitRequestFullscreen) {
        await containerRef.current.webkitRequestFullscreen();
        setIsFullscreen(true);
        return true;
      } else if (containerRef.current?.mozRequestFullScreen) {
        await containerRef.current.mozRequestFullScreen();
        setIsFullscreen(true);
        return true;
      } else if (containerRef.current?.msRequestFullscreen) {
        await containerRef.current.msRequestFullscreen();
        setIsFullscreen(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Fullscreen request failed:", error);
      return false;
    }
  };

  const exitFullscreen = () => {
    if (isMobile) return;

    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  // Show warning modal
  const showWarningModal = (message) => {
    setWarningMessage(message);
    setShowWarning(true);
  };

  // Auto-submit interview
  const autoSubmitInterview = async () => {
    setSubmitting(true);
    setIsTimerRunning(false);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000"}/api/interview/submit/${sessionId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers,
            duration: timer,
            autoSubmitted: true,
            reason: "Multiple violations detected",
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to submit interview");
      localStorage.removeItem(`interview_${sessionId}`);
      if (document.fullscreenElement && !isMobile) {
        await exitFullscreen();
      }
      navigate(`/report/${sessionId}`);
    } catch (err) {
      console.error(err);
      alert("Interview auto-submitted due to violations");
      navigate("/");
    } finally {
      setSubmitting(false);
    }
  };

  // Monitor fullscreen changes - Skip on mobile
  useEffect(() => {
    if (isMobile) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);

      // If interview started and user exits fullscreen
      if (interviewStarted && !isCurrentlyFullscreen && !submitting) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          if (newCount === 1) {
            showWarningModal(
              "⚠️ Warning: You must stay in fullscreen mode during the interview. This is warning 1/2.",
            );
            // Force back to fullscreen after warning
            setTimeout(() => {
              enterFullscreen();
            }, 3000);
          } else if (newCount >= 2) {
            showWarningModal(
              "❌ Interview terminated: You have exited fullscreen mode multiple times. The interview will now be auto-submitted.",
            );
            setTimeout(() => {
              autoSubmitInterview();
            }, 3000);
          }
          return newCount;
        });
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [interviewStarted, submitting, isMobile]);

  // Monitor tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && interviewStarted && !submitting) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          if (newCount === 1) {
            showWarningModal(
              "⚠️ Warning: Tab switching is not allowed during the interview. This is warning 1/2.",
            );
          } else if (newCount >= 2) {
            showWarningModal(
              "❌ Interview terminated: Multiple tab switches detected. The interview will now be auto-submitted.",
            );
            setTimeout(() => {
              autoSubmitInterview();
            }, 3000);
          }
          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [interviewStarted, submitting]);

  // Prevent common keyboard shortcuts (except coding shortcuts)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!interviewStarted) return;

      // Allow common coding shortcuts
      const allowedCodingShortcuts = [
        e.ctrlKey && e.key === 'c', // Copy
        e.ctrlKey && e.key === 'v', // Paste
        e.ctrlKey && e.key === 'x', // Cut
        e.ctrlKey && e.key === 'z', // Undo
        e.ctrlKey && e.key === 'y', // Redo
        e.ctrlKey && e.key === 'a', // Select all
        e.ctrlKey && e.key === 'f', // Find
        e.ctrlKey && e.key === 's', // Save (for code editor)
        e.key === 'Tab', // Tab for indentation
        e.key === 'Enter', // Enter for new lines
        e.key === 'Backspace', // Backspace
        e.key === 'Delete', // Delete
        e.key.startsWith('Arrow'), // Arrow keys
        e.key === 'Home', // Home key
        e.key === 'End', // End key
        e.key === 'PageUp', // Page up
        e.key === 'PageDown', // Page down
      ];

      // Only allow coding shortcuts if focus is on code editor
      const isCodeEditorFocused = document.activeElement === codeEditorRef.current;

      if (allowedCodingShortcuts.some(condition => condition) && isCodeEditorFocused) {
        return; // Allow these shortcuts
      }

      // Prevent dangerous shortcuts
      const preventedKeys = [
        e.altKey && e.key === "Tab",
        e.ctrlKey && e.key === "Tab",
        e.metaKey && e.key === "Tab",
        e.key === "F11",
        e.key === "Escape" && document.fullscreenElement && !isMobile,
        e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "C" || e.key === "J"), // Dev tools
        e.key === "F12", // Dev tools
        e.ctrlKey && e.key === "u", // View source
        e.ctrlKey && e.key === "r", // Refresh
        e.key === "F5", // Refresh
      ];

      if (preventedKeys.some((condition) => condition)) {
        e.preventDefault();
        e.stopPropagation();
        showWarningModal(
          "⚠️ This keyboard shortcut is disabled during the technical interview.",
        );
        return false;
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [interviewStarted, isMobile]);

  // Prevent right-click context menu
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (interviewStarted) {
        e.preventDefault();
        showWarningModal("⚠️ Right-click is disabled during the interview.");
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [interviewStarted]);

  // Start interview function
  const startInterview = async () => {
    try {
      if (isMobile) {
        setInterviewStarted(true);
        setIsTimerRunning(true);
      } else {
        const success = await enterFullscreen();
        if (success) {
          setInterviewStarted(true);
          setIsTimerRunning(true);
        } else {
          alert(
            "Fullscreen mode is required to start the interview. Please allow fullscreen access.",
          );
        }
      }
    } catch (error) {
      if (!isMobile) {
        alert(
          "Fullscreen mode is required to start the interview. Please allow fullscreen access.",
        );
      }
    }
  };

  useEffect(() => {
    // Get webcam with better error handling and mobile optimization
    const initializeCamera = async () => {
      try {
        const constraints = {
          video: {
            width: isMobile ? { ideal: 320 } : { ideal: 640 },
            height: isMobile ? { ideal: 240 } : { ideal: 480 },
            facingMode: "user",
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setVideoStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        alert(
          "Camera access is required for the interview. Please allow access and refresh the page.",
        );
      }
    };

    initializeCamera();

    // Load technical questions
    const storedQuestions = localStorage.getItem(`interview_${sessionId}`);
    if (storedQuestions) {
      const parsedQuestions = JSON.parse(storedQuestions);
      setQuestions(parsedQuestions);
      setAnswers(new Array(parsedQuestions.length).fill(""));
      setLoading(false);
    } else {
      // Technical coding questions
      const technicalQuestions = [
        "Write a function to reverse a string without using built-in reverse methods.",
        "Implement a function to check if a string is a palindrome.",
        "Write a function to find the factorial of a number using recursion.",
        "Create a function to find the largest element in an array.",
        "Implement a function to remove duplicates from an array.",
      ];
      setQuestions(technicalQuestions);
      setAnswers(new Array(technicalQuestions.length).fill(""));
      localStorage.setItem(
        `interview_${sessionId}`,
        JSON.stringify(technicalQuestions),
      );
      setLoading(false);
    }

    return () => {
      // Cleanup
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
      clearInterval(timerRef.current);
    };
  }, [sessionId, isMobile]);

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    setCurrentAnswer(value);
  };

  const nextQuestion = () => {
    setCurrentQuestion((prev) => {
      const next = Math.min(prev + 1, questions.length - 1);
      setCurrentAnswer(answers[next] || "");
      return next;
    });
  };

  const previousQuestion = () => {
    setCurrentQuestion((prev) => {
      const previous = Math.max(prev - 1, 0);
      setCurrentAnswer(answers[previous] || "");
      return previous;
    });
  };

  const submitInterview = async () => {
    setSubmitting(true);
    setIsTimerRunning(false);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000"}/api/interview/submit/${sessionId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers, duration: timer }),
        },
      );

      if (!res.ok) throw new Error("Failed to submit interview");
      localStorage.removeItem(`interview_${sessionId}`);
      if (document.fullscreenElement && !isMobile) {
        await exitFullscreen();
      }
      navigate(`/report/${sessionId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to submit interview");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-yellow-400 text-xl animate-pulse">
          Loading technical interview...
        </div>
      </div>
    );

  // Show start screen if interview hasn't started
  return (

    <>
    {!interviewStarted &&
      
       <div className="min-h-screen fixed inset-0 z-[999] flex items-center justify-center bg-black text-white font-inter p-4">
         <div className="text-center max-w-2xl w-full">
           <h1 className="text-2xl md:text-4xl font-bold text-yellow-400 mb-6">
             💻 Technical Interview Ready
           </h1>
           <div className="text-sm md:text-lg text-gray-300 mb-8 space-y-4">
             <p>
               ⚠️ <strong>Technical Interview Guidelines:</strong>
             </p>
             <ul className="text-left space-y-2 bg-gray-900 p-4 md:p-6 rounded-lg text-xs md:text-sm">
               {!isMobile && <li>• This interview must be completed in fullscreen mode</li>}
               <li>• You will be asked to write code solutions</li>
               <li>• Tab switching is monitored during the interview</li>
               <li>• Coding shortcuts (Ctrl+C, Ctrl+V, Tab) are allowed</li>
               <li>• You will receive 1 warning for violations</li>
               <li>• After 2 violations, the interview will auto-submit</li>
               <li>• Ensure your webcam is working for monitoring</li>
               <li>• Write clean, well-commented code</li>
               {isMobile && <li>• Mobile users: Please don't switch between apps during the interview</li>}
             </ul>
           </div>
           <button
             onClick={startInterview}
             className="bg-yellow-400 text-black px-6 md:px-8 py-3 md:py-4 rounded-lg text-lg md:text-xl font-semibold hover:bg-yellow-300 transition-all duration-200 w-full md:w-auto"
           >
             🚀 Start Technical Interview {!isMobile && "(Enter Fullscreen)"}
           </button>
         </div>
       </div>
     }
   
 
  
     <div
       ref={containerRef}
       className={`${isMobile ? 'min-h-screen' : 'fixed inset-0'} z-50 bg-black text-white font-inter overflow-hidden`}
     >
       {/* Warning Modal */}
       {showWarning && (
         <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100] p-4">
           <div className="bg-red-900 border-2 border-red-500 rounded-lg p-6 md:p-8 max-w-md w-full text-center">
             <h2 className="text-xl md:text-2xl font-bold text-red-400 mb-4">
               ⚠️ WARNING
             </h2>
             <p className="text-white mb-6 text-sm md:text-base">
               {warningMessage}
             </p>
             <button
               onClick={() => setShowWarning(false)}
               className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-400 transition-all duration-200"
             >
               I Understand
             </button>
           </div>
         </div>
       )}
 
       {/* Timer and Controls Header */}
       <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 flex justify-between items-center z-10 flex-wrap gap-2">
         <div className="flex items-center gap-2 md:gap-4 flex-wrap">
           <div className="bg-red-600 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-mono">
             🔴 {formatTime(timer)}
           </div>
           <div className="text-xs md:text-sm text-gray-400">
             Problem {currentQuestion + 1}/{questions.length}
           </div>
           {tabSwitchCount > 0 && (
             <div className="bg-red-500 px-2 md:px-3 py-1 rounded-full text-xs">
               ⚠️ {tabSwitchCount}/2
             </div>
           )}
         </div>
 
         <div className="flex items-center gap-2">
           <div className="bg-green-600 px-2 md:px-3 py-1 rounded text-xs md:text-sm">
             🔒 Secure
           </div>
           {isMobile && (
             <div className="bg-blue-600 px-2 md:px-3 py-1 rounded text-xs">
               📱 Mobile
             </div>
           )}
         </div>
       </div>
 
       {/* Main Content */}
       <div className="flex h-full pt-12 md:pt-16">
         {/* Question and Camera Section */}
         <div className="w-full lg:w-1/3 bg-[#111] border-r border-yellow-400/30 p-4 md:p-6 flex flex-col">
           {/* Question */}
           <div className="mb-6">
             <h2 className="text-lg md:text-xl font-bold text-yellow-400 mb-3">
               💻 Coding Problem {currentQuestion + 1}
             </h2>
             <div className="bg-black/50 rounded-lg p-4 text-sm md:text-base text-gray-300">
               {questions[currentQuestion]}
             </div>
           </div>
 
           {/* Camera Feed */}
           <div className="flex flex-col items-center">
             <div className="text-yellow-400 text-sm font-semibold mb-2">
               Live Monitoring
             </div>
             <div className="w-32 h-24 md:w-40 md:h-30 rounded-lg overflow-hidden border-2 border-gray-600">
               <video
                 ref={videoRef}
                 autoPlay
                 muted
                 playsInline
                 className="w-full h-full object-cover"
               />
             </div>
           </div>
 
           {/* Progress Indicators */}
           <div className="mt-6">
             <div className="text-xs text-gray-400 mb-2">Progress</div>
             <div className="flex gap-1">
               {questions.map((_, i) => (
                 <div
                   key={i}
                   className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                     i === currentQuestion
                       ? "bg-yellow-400"
                       : answers[i]
                         ? "bg-green-500"
                         : "bg-gray-600"
                   }`}
                 />
               ))}
             </div>
           </div>
         </div>
 
         {/* Code Editor Section */}
         <div className="flex-1 bg-[#0a0a0a] p-4 md:p-6 flex flex-col">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-yellow-400">
               💻 Code Editor
             </h3>
             <div className="text-xs text-gray-400">
               Use keyboard shortcuts: Ctrl+C, Ctrl+V, Tab, etc.
             </div>
           </div>
 
           {/* Code Editor */}
           <div className="flex-1 mb-4">
             <textarea
               ref={codeEditorRef}
               value={currentAnswer}
               onChange={(e) => handleAnswerChange(e.target.value)}
               placeholder="// Write your solution here...
 // Example:
 function solution() {
     // Your code here
     return result;
 }
 
 // Test your solution
 console.log(solution());"
               className="w-full h-full bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm resize-none border border-gray-700 focus:border-yellow-400 focus:outline-none"
               style={{ 
                 minHeight: '400px',
                 fontFamily: 'Monaco, Menlo, \"Ubuntu Mono\", monospace',
                 tabSize: 4,
                 lineHeight: '1.5'
               }}
               onKeyDown={(e) => {
                 if (e.key === 'Tab') {
                   e.preventDefault();
                   const start = e.target.selectionStart;
                   const end = e.target.selectionEnd;
                   const value = e.target.value;
                   const newValue = value.substring(0, start) + '    ' + value.substring(end);
                   handleAnswerChange(newValue);
                   // Set cursor position after the inserted tab
                   setTimeout(() => {
                     e.target.selectionStart = e.target.selectionEnd = start + 4;
                   }, 0);
                 }
               }}
             />
           </div>
 
           {/* Control Buttons */}
           <div className="flex gap-3 flex-wrap">
             <button
               onClick={previousQuestion}
               disabled={currentQuestion === 0}
               className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
             >
               ← Previous
             </button>
 
             {currentQuestion === questions.length - 1 ? (
               <button
                 onClick={submitInterview}
                 disabled={submitting}
                 className="flex-1 bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 disabled:opacity-50 transition-all duration-200"
               >
                 {submitting ? "Submitting..." : "✅ Submit Interview"}
               </button>
             ) : (
               <button
                 onClick={nextQuestion}
                 className="flex-1 bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-all duration-200"
               >
                 Next Problem →
               </button>
             )}
           </div>
 
           {/* Instructions */}
           <div className="mt-4 text-xs text-gray-500 space-y-1">
             <p>💡 Tips:</p>
             <ul className="list-disc list-inside space-y-1 ml-2">
               <li>Write clean, readable code with proper indentation</li>
               <li>Add comments to explain your logic</li>
               <li>Test your solution with different inputs</li>
               <li>Consider edge cases and error handling</li>
             </ul>
           </div>
         </div>
       </div>
     </div>
  
     </>
  );
}