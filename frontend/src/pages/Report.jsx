/* eslint-disable no-empty */
import { useEffect, useState } from "react";
import axios from "axios";

function Report() {
  const [evaluation, setEvaluation] = useState(null);

  const questions = JSON.parse(localStorage.getItem("questions") || "[]");
  const answers = JSON.parse(localStorage.getItem("answers") || "[]");
  const ideals = JSON.parse(localStorage.getItem("ideals") || "[]");

  useEffect(() => {
    const fetchEvaluation = async () => {
      const res = await axios.post("http://localhost:5000/evaluate", {
        questions,
        answers,
        ideals,
      });

      try {
        const parsed = JSON.parse(res.data.evaluation);
        setEvaluation(parsed);
        localStorage.setItem("evaluation", JSON.stringify(parsed));
      } catch {}
    };

    fetchEvaluation();
  }, []);

  if (!evaluation) return <p>Evaluating... (fast now)</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Final Report</h2>

      {/* ✅ Overall Score */}
      <h3>Overall Score: {evaluation.overall_score}</h3>

      {/* ✅ Question-wise */}
      <h3>Question-wise Feedback:</h3>
      {evaluation.question_wise.map((q, i) => (
        <div key={i}>
          <p>
            <b>Q{i + 1}:</b> {questions[i]}
          </p>
          <p>
            <b>Your Answer:</b> {answers[i]}
          </p>
          <p>
            <b>Ideal Answer:</b> {ideals[i]}
          </p>
          <p>
            <b>Score:</b> {q.score}
          </p>
          <p>{q.feedback}</p>
          <hr />
        </div>
      ))}

      {/* ✅ Strengths */}
      <h3>Strengths</h3>
      <ul>
        {evaluation.strengths?.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>

      {/* ✅ Weaknesses */}
      <h3>Weaknesses</h3>
      <ul>
        {evaluation.weaknesses?.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>

      {/* ✅ Improvements */}
      <h3>Improvements</h3>
      <ul>
        {evaluation.improvements?.map((imp, i) => (
          <li key={i}>{imp}</li>
        ))}
      </ul>
    </div>
  );
}

export default Report;
