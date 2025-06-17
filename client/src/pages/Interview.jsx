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
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
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
          handleAnswerChange(answers[currentQuestion] + ' ' + finalTranscript);
        }
      };

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);

      recognitionRef.current.start(); // Start listening by default
    }

    // Speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Get webcam
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Webcam access denied", err);
      });

    // Load questions
    const storedQuestions = localStorage.getItem(`interview_${sessionId}`);
    if (storedQuestions) {
      const parsedQuestions = JSON.parse(storedQuestions);
      setQuestions(parsedQuestions);
      setAnswers(new Array(parsedQuestions.length).fill(''));
      setLoading(false);
      setTimeout(() => speakQuestion(parsedQuestions[0]), 1000);
    } else {
      setLoading(false);
    }

    return () => {
      const tracks = videoRef.current?.srcObject?.getTracks();
      tracks?.forEach(track => track.stop());
    };
  }, [sessionId]);

  useEffect(() => {
    if (questions.length > 0) speakQuestion(questions[currentQuestion]);
  }, [currentQuestion]);

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const speakQuestion = (question) => {
    if (synthRef.current && question) {
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

  const nextQuestion = () => setCurrentQuestion((prev) => Math.min(prev + 1, questions.length - 1));
  const prevQuestion = () => setCurrentQuestion((prev) => Math.max(prev - 1, 0));

  const submitInterview = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3000/api/interview/submit/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) throw new Error("Failed to submit interview");
      localStorage.removeItem(`interview_${sessionId}`);
      navigate(`/report/${sessionId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to submit interview");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-yellow-400 p-10">Loading interview...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-inter px-6 py-10 flex justify-center">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl gap-6">
        {/* AI Section */}
        <div className="flex-1 bg-[#111] rounded-xl border border-yellow-400/30 p-6 shadow-lg flex flex-col items-center justify-between">
          <div className="text-center">
            <div className="text-yellow-400 text-xl font-bold mb-2">AI Interviewer</div>
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-yellow-300 via-yellow-500 to-yellow-400 flex items-center justify-center text-4xl">
              🤖
            </div>
          </div>

          <div className="mt-10 text-center">
            <h2 className="text-lg font-semibold mb-2">{questions[currentQuestion]}</h2>
            <button
              onClick={() => speakQuestion(questions[currentQuestion])}
              className="mt-2 text-sm bg-yellow-400 px-3 py-1 rounded-lg text-black hover:bg-yellow-300"
            >
              🔊 Repeat Question
            </button>
          </div>
        </div>

        {/* Response & Webcam */}
        <div className="flex-[2] bg-[#111] rounded-xl border border-yellow-400/30 p-6 shadow-lg relative">
          <div className="absolute top-4 right-4">
            <button className="text-white bg-gray-700 px-2 py-1 rounded hover:bg-gray-600 text-xs" title="Open chat">
              💬 Chat
            </button>
          </div>

          {/* Webcam */}
          <div className={`w-36 h-36 rounded-full overflow-hidden mx-auto border-4 transition-all duration-500 ${isListening ? 'border-green-400 shadow-green-400 shadow-md' : 'border-gray-600'}`}>
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
          </div>

          {/* Textarea */}
          <textarea
            value={answers[currentQuestion] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Speak or type your answer..."
            className="w-full mt-6 h-32 bg-black border border-yellow-400/40 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition resize-none"
            maxLength={500}
          />

          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>{answers[currentQuestion]?.length || 0}/500 characters</span>
            {speechSupported && <span>🎤 Voice active</span>}
          </div>

          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="px-5 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-40 hover:bg-gray-500"
            >
              Previous
            </button>

            <div className="flex gap-2">
              {questions.map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i === currentQuestion ? 'bg-yellow-400' : answers[i] ? 'bg-green-500' : 'bg-gray-600'}`} />
              ))}
            </div>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={submitInterview}
                disabled={submitting}
                className="px-5 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-5 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
