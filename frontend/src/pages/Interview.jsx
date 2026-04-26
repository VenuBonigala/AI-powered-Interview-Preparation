import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Interview() {
  const navigate = useNavigate();

  const raw = localStorage.getItem("questions");

  let questions = [];

  try {
    questions = JSON.parse(raw);
  } catch {
    questions = raw
      ?.replace("[", "")
      .replace("]", "")
      .split(",")
      .map((q) => q.trim().replace(/"/g, ""));
  }

  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [ideals, setIdeals] = useState([]);

  const handleNext = async () => {
    const updatedAnswers = [...answers, answer];
    const currentQuestion = questions[current];

    let idealAnswer = "";

    try {
      const res = await fetch("http://localhost:5000/ideal-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: currentQuestion }),
      });

      const data = await res.json();
      idealAnswer = data.ideal;
    } catch {
      idealAnswer = "";
    }

    const updatedIdeals = [...ideals, idealAnswer];

    setAnswers(updatedAnswers);
    setIdeals(updatedIdeals);
    setAnswer("");

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      localStorage.setItem("answers", JSON.stringify(updatedAnswers));
      localStorage.setItem("questions", JSON.stringify(questions));
      localStorage.setItem("ideals", JSON.stringify(updatedIdeals));
      navigate("/report");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Interview</h2>

      <p>
        <b>Question {current + 1}:</b>
      </p>
      <p>{questions[current]}</p>

      <textarea
        rows="5"
        cols="50"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleNext}>
        {current + 1 === questions.length ? "Finish" : "Next"}
      </button>
    </div>
  );
}

export default Interview;
