
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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [interviewerFinished, setInterviewerFinished] = useState(false);
  const [candidateSpeaking, setCandidateSpeaking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // New states for monitoring
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  // Timer functionality
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Enhanced fullscreen functionality
  const enterFullscreen = async () => {
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
      console.error('Fullscreen request failed:', error);
      return false;
    }
  };

  const exitFullscreen = () => {
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
    finishCandidateResponse();
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000'}/api/interview/submit/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          answers, 
          duration: timer,
          autoSubmitted: true,
          reason: 'Multiple violations detected'
        }),
      });

      if (!res.ok) throw new Error("Failed to submit interview");
      localStorage.removeItem(`interview_${sessionId}`);
      if (document.fullscreenElement) {
        await exitFullscreen();
      }
      navigate(`/report/${sessionId}`);
    } catch (err) {
      console.error(err);
      alert("Interview auto-submitted due to violations");
      navigate('/');
    } finally {
      setSubmitting(false);
    }
  };

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
      setIsFullscreen(isCurrentlyFullscreen);
      
      // If interview started and user exits fullscreen
      if (interviewStarted && !isCurrentlyFullscreen && !submitting) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          if (newCount === 1) {
            showWarningModal('⚠️ Warning: You must stay in fullscreen mode during the interview. This is warning 1/2.');
            // Force back to fullscreen after warning
            setTimeout(() => {
              enterFullscreen();
            }, 3000);
          } else if (newCount >= 2) {
            showWarningModal('❌ Interview terminated: You have exited fullscreen mode multiple times. The interview will now be auto-submitted.');
            setTimeout(() => {
              autoSubmitInterview();
            }, 3000);
          }
          return newCount;
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [interviewStarted, submitting]);

  // Monitor tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && interviewStarted && !submitting) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          if (newCount === 1) {
            showWarningModal('⚠️ Warning: Tab switching is not allowed during the interview. This is warning 1/2.');
          } else if (newCount >= 2) {
            showWarningModal('❌ Interview terminated: Multiple tab switches detected. The interview will now be auto-submitted.');
            setTimeout(() => {
              autoSubmitInterview();
            }, 3000);
          }
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [interviewStarted, submitting]);

  // Prevent common keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!interviewStarted) return;
      
      // Prevent Alt+Tab, Ctrl+Tab, Cmd+Tab, F11, Escape, etc.
      const preventedKeys = [
        (e.altKey && e.key === 'Tab'),
        (e.ctrlKey && e.key === 'Tab'),
        (e.metaKey && e.key === 'Tab'),
        (e.key === 'F11'),
        (e.key === 'Escape' && document.fullscreenElement),
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')), // Dev tools
        (e.key === 'F12'), // Dev tools
        (e.ctrlKey && e.key === 'u'), // View source
        (e.ctrlKey && e.key === 'r'), // Refresh
        (e.key === 'F5'), // Refresh
      ];

      if (preventedKeys.some(condition => condition)) {
        e.preventDefault();
        e.stopPropagation();
        showWarningModal('⚠️ Keyboard shortcuts are disabled during the interview.');
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [interviewStarted]);

  // Prevent right-click context menu
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (interviewStarted) {
        e.preventDefault();
        showWarningModal('⚠️ Right-click is disabled during the interview.');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [interviewStarted]);

  // Start interview function
  const startInterview = async () => {
    try {
      const success = await enterFullscreen();
      if (success) {
        setInterviewStarted(true);
        setIsTimerRunning(true);
        setTimeout(() => {
          speakQuestion(questions[0]);
        }, 1000);
      } else {
        alert('Fullscreen mode is required to start the interview. Please allow fullscreen access.');
      }
    } catch (error) {
      alert('Fullscreen mode is required to start the interview. Please allow fullscreen access.');
    }
  };

  useEffect(() => {
    // Initialize speech recognition with better error handling
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript && candidateSpeaking) {
          setCurrentAnswer(prev => (prev + ' ' + finalTranscript).trim());
          handleAnswerChange((answers[currentQuestion] || '') + ' ' + finalTranscript);
        }
      };

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    // Speech synthesis with better browser support
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Get webcam with better error handling
    const initializeCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false 
        });
        setVideoStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        alert("Camera access is required for the interview. Please allow camera access and refresh the page.");
      }
    };

    initializeCamera();

    // Load questions
    const storedQuestions = localStorage.getItem(`interview_${sessionId}`);
    if (storedQuestions) {
      const parsedQuestions = JSON.parse(storedQuestions);
      setQuestions(parsedQuestions);
      setAnswers(new Array(parsedQuestions.length).fill(''));
      setLoading(false);
    } else {
      // If no stored questions, create some default ones
      const defaultQuestions = [
        "Tell me about yourself and your background.",
        "What interests you about this position?",
        "What are your greatest strengths?",
        "Describe a challenging project you've worked on.",
        "Where do you see yourself in 5 years?"
      ];
      setQuestions(defaultQuestions);
      setAnswers(new Array(defaultQuestions.length).fill(''));
      localStorage.setItem(`interview_${sessionId}`, JSON.stringify(defaultQuestions));
      setLoading(false);
    }

    return () => {
      // Cleanup
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      clearInterval(timerRef.current);
    };
  }, [sessionId]);

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const speakQuestion = (question) => {
    if (synthRef.current && question) {
      synthRef.current.cancel();
      setInterviewerFinished(false);
      setCandidateSpeaking(false);
      
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        setInterviewerFinished(true);
      };
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
        setInterviewerFinished(true);
      };
      synthRef.current.speak(utterance);
    }
  };

  const startCandidateResponse = () => {
    setCandidateSpeaking(true);
    setCurrentAnswer('');
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  };

  const finishCandidateResponse = () => {
    setCandidateSpeaking(false);
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Failed to stop speech recognition:', error);
      }
    }
  };

  const nextQuestion = () => {
    finishCandidateResponse();
    setCurrentQuestion((prev) => {
      const next = Math.min(prev + 1, questions.length - 1);
      if (next < questions.length) {
        setTimeout(() => speakQuestion(questions[next]), 500);
      }
      return next;
    });
  };

  const submitInterview = async () => {
    setSubmitting(true);
    setIsTimerRunning(false);
    finishCandidateResponse();
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000'}/api/interview/submit/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, duration: timer }),
      });

      if (!res.ok) throw new Error("Failed to submit interview");
      localStorage.removeItem(`interview_${sessionId}`);
      if (document.fullscreenElement) {
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-yellow-400 text-xl animate-pulse">Loading interview...</div>
    </div>
  );

  // Show start screen if interview hasn't started
  if (!interviewStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white font-inter p-4">
        <div className="text-center max-w-2xl w-full">
          <h1 className="text-2xl md:text-4xl font-bold text-yellow-400 mb-6">Interview Ready</h1>
          <div className="text-sm md:text-lg text-gray-300 mb-8 space-y-4">
            <p>⚠️ <strong>Important Guidelines:</strong></p>
            <ul className="text-left space-y-2 bg-gray-900 p-4 md:p-6 rounded-lg text-xs md:text-sm">
              <li>• This interview must be completed in fullscreen mode</li>
              <li>• Tab switching is not allowed during the interview</li>
              <li>• Keyboard shortcuts will be disabled</li>
              <li>• You will receive 1 warning for violations</li>
              <li>• After 2 violations, the interview will auto-submit</li>
              <li>• Ensure your webcam and microphone are working</li>
            </ul>
          </div>
          <button
            onClick={startInterview}
            className="bg-yellow-400 text-black px-6 md:px-8 py-3 md:py-4 rounded-lg text-lg md:text-xl font-semibold hover:bg-yellow-300 transition-all duration-200 w-full md:w-auto"
          >
            🚀 Start Interview (Enter Fullscreen)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black text-white font-inter overflow-hidden"
    >
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100] p-4">
          <div className="bg-red-900 border-2 border-red-500 rounded-lg p-6 md:p-8 max-w-md w-full text-center">
            <h2 className="text-xl md:text-2xl font-bold text-red-400 mb-4">⚠️ WARNING</h2>
            <p className="text-white mb-6 text-sm md:text-base">{warningMessage}</p>
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
            Q {currentQuestion + 1}/{questions.length}
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row h-full pt-12 md:pt-16">
        {/* AI Interviewer Section */}
        <div className="w-full md:w-1/2 bg-[#111] border-b md:border-b-0 md:border-r border-yellow-400/30 p-4 md:p-8 flex flex-col items-center justify-center min-h-[40vh] md:min-h-full">
          <div className="text-center">
            <div className="text-yellow-400 text-lg md:text-2xl font-bold mb-4">AI Interviewer</div>
            <div className={`w-24 h-24 md:w-48 md:h-48 rounded-full flex items-center justify-center text-3xl md:text-6xl transition-all duration-300 ${
              isSpeaking 
                ? 'bg-gradient-to-tr from-green-400 via-green-500 to-green-300 animate-pulse shadow-green-400 shadow-2xl' 
                : 'bg-gradient-to-tr from-yellow-300 via-yellow-500 to-yellow-400'
            }`}>
              🤖
            </div>
            
            {isSpeaking && (
              <div className="mt-4 text-green-400 font-semibold animate-pulse text-sm md:text-base">
                Speaking...
              </div>
            )}
          </div>

          <div className="mt-4 md:mt-8 text-center max-w-md">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-yellow-400">
              {questions[currentQuestion]}
            </h2>
          </div>
        </div>

        {/* Candidate Section */}
        <div className="w-full md:w-1/2 bg-[#0a0a0a] p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh] md:min-h-full">
          <div className="text-center mb-4 md:mb-8 w-full">
            <div className="text-yellow-400 text-lg md:text-2xl font-bold mb-4">You</div>
            
            {/* Live Camera Feed */}
            <div className={`w-32 h-24 md:w-80 md:h-56 rounded-lg overflow-hidden mx-auto border-4 transition-all duration-300 ${
              candidateSpeaking 
                ? 'border-red-500 shadow-red-500 shadow-2xl animate-pulse' 
                : isListening 
                ? 'border-green-400 shadow-green-400 shadow-md' 
                : 'border-gray-600'
            }`}>
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                className="w-full h-full object-cover" 
              />
            </div>

            {candidateSpeaking && (
              <div className="mt-4 text-red-400 font-semibold animate-pulse text-sm md:text-base">
                🎤 Recording...
              </div>
            )}
          </div>

          {/* Response Display */}
          <div className="w-full max-w-md">
            <div className="bg-black border border-yellow-400/40 rounded-xl p-3 md:p-4 mb-4 min-h-20 md:min-h-32">
              <div className="text-gray-300 text-sm md:text-base max-h-24 md:max-h-32 overflow-y-auto">
                {answers[currentQuestion] || "Your response will appear here..."}
              </div>
            </div>

            <div className="text-xs text-gray-400 mb-4 md:mb-6 text-center">
              {speechSupported ? "🎤 Voice recognition active" : "Voice not supported - Please type your response"}
            </div>

            {/* Manual text input for backup */}
            {!speechSupported && (
              <textarea
                value={answers[currentQuestion] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your response here..."
                className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4 min-h-24 resize-none"
              />
            )}

            {/* Control Buttons */}
            <div className="flex flex-col gap-3">
              {interviewerFinished && !candidateSpeaking && speechSupported && (
                <button
                  onClick={startCandidateResponse}
                  className="bg-green-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-green-400 transition-all duration-200 animate-bounce text-sm md:text-base"
                >
                  🎤 Start Speaking
                </button>
              )}
              {candidateSpeaking && (
                <button
                  onClick={finishCandidateResponse}
                  className="bg-red-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-red-400 transition-all duration-200 text-sm md:text-base"
                >
                  ✋ Done Speaking
                </button>
              )}

              {!candidateSpeaking && !isSpeaking && (
                <div className="flex gap-3">
                  {currentQuestion === questions.length - 1 ? (
                    <button
                      onClick={submitInterview}
                      disabled={submitting}
                      className="flex-1 bg-yellow-400 text-black px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-yellow-300 disabled:opacity-50 transition-all duration-200 text-sm md:text-base"
                    >
                      {submitting ? 'Submitting...' : '✅ Submit Interview'}
                    </button>
                  ) : (
                    <button
                      onClick={nextQuestion}
                      className="flex-1 bg-yellow-400 text-black px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-all duration-200 text-sm md:text-base"
                    >
                      ➡️ Next Question
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-1 md:gap-2 mt-4 md:mt-6">
            {questions.map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
                  i === currentQuestion 
                    ? 'bg-yellow-400 scale-125' 
                    : answers[i] 
                    ? 'bg-green-500' 
                    : 'bg-gray-600'
                }`} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
