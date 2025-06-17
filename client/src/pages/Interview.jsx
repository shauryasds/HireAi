
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function Interview() {
  const { sessionId } = useParams(); // This is the interviewId
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition and synthesis
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          handleAnswerChange(answers[currentQuestion] + finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Get questions from the interview start
    const storedQuestions = localStorage.getItem(`interview_${sessionId}`);
    if (storedQuestions) {
      const parsedQuestions = JSON.parse(storedQuestions);
      setQuestions(parsedQuestions);
      setAnswers(new Array(parsedQuestions.length).fill(''));
      setLoading(false);
      // Speak the first question
      setTimeout(() => speakQuestion(parsedQuestions[0]), 1000);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  // Speak question when it changes
  useEffect(() => {
    if (questions.length > 0 && currentQuestion >= 0) {
      speakQuestion(questions[currentQuestion]);
    }
  }, [currentQuestion, questions]);

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const speakQuestion = (question) => {
    if (synthRef.current && question) {
      // Stop any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitInterview = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/interview/submit/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) throw new Error("Failed to submit interview");

      const data = await res.json();
      localStorage.removeItem(`interview_${sessionId}`);
      navigate(`/report/${sessionId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to submit interview");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-yellow-400 font-semibold text-lg animate-pulse">
        Loading interview...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-500 font-semibold text-lg">
        Interview not found or expired
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-10 font-inter">
      <div className="bg-[#111] border border-yellow-500/20 shadow-yellow-200/10 shadow-lg rounded-2xl p-8 w-full max-w-3xl text-white">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-yellow-400">AI Interview</h1>
            <span className="text-sm text-gray-400">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          
          <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
            <div 
              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex-1">
              {questions[currentQuestion]}
            </h2>
            <div className="flex gap-2 ml-4">
              {isSpeaking ? (
                <button
                  onClick={stopSpeaking}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition text-sm"
                  title="Stop speaking"
                >
                  🔇 Stop
                </button>
              ) : (
                <button
                  onClick={() => speakQuestion(questions[currentQuestion])}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition text-sm"
                  title="Read question aloud"
                >
                  🔊 Listen
                </button>
              )}
            </div>
          </div>
          
          <div className="relative">
            <textarea
              value={answers[currentQuestion] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here or use voice input..."
              className="w-full h-32 bg-black border border-yellow-400/40 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition resize-none"
              maxLength={500}
            />
            
            {speechSupported && (
              <button
                onClick={toggleListening}
                className={`absolute bottom-3 right-3 px-3 py-2 rounded-lg transition text-sm font-medium ${
                  isListening 
                    ? 'bg-red-500 text-white hover:bg-red-400 animate-pulse' 
                    : 'bg-green-500 text-white hover:bg-green-400'
                }`}
                title={isListening ? 'Stop recording' : 'Start voice input'}
              >
                {isListening ? '🎤 Recording...' : '🎤 Voice'}
              </button>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-400">
              {answers[currentQuestion]?.length || 0}/500 characters
            </p>
            {speechSupported && (
              <p className="text-xs text-gray-400">
                Click 🎤 Voice to speak your answer
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentQuestion 
                    ? 'bg-yellow-400' 
                    : answers[index] 
                      ? 'bg-green-500' 
                      : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={submitInterview}
              disabled={submitting}
              className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Interview'}
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
