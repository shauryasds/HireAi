import { useParams } from "react-router-dom";

export default function Report() {
  const { candidateId } = useParams();

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">Candidate Report: {candidateId}</h1>
      {/* Fetch and display resume score, answers, AI feedback */}
      <p>This is a sample report page. Integrate with backend analysis.</p>
    </div>
  );
}
