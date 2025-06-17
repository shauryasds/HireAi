import { useParams } from "react-router-dom";

export default function Interview() {
  const { sessionId } = useParams();

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">AI Interview – Session: {sessionId}</h1>
      {/* Add webcam, questions, timers here */}
      <p>Interview questions will appear here.</p>
      <button className="bg-purple-600 text-white px-4 py-2 mt-4 rounded">Start Interview</button>
    </div>
  );
}
