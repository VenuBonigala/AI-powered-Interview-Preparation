import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MockForm() {
  const [level, setLevel] = useState("");
  const [duration, setDuration] = useState("");
  const navigate = useNavigate();

  const startInterview = async () => {
    try {
      const res = await axios.post("http://localhost:5000/generate-questions", {
        level,
        duration,
      });

      localStorage.setItem("questions", res.data.questions);
      navigate("/interview");
    } catch (err) {
      console.error(err);
      alert("Failed to generate questions");
    }
  };

  return (
    <div>
      <h2>Mock Interview Setup</h2>

      <input placeholder="Level" onChange={(e) => setLevel(e.target.value)} />
      <br />

      <input
        placeholder="Duration (mins)"
        onChange={(e) => setDuration(e.target.value)}
      />
      <br />
      <br />

      <button onClick={startInterview}>Start</button>
    </div>
  );
}

export default MockForm;
