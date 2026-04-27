import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppShell from "../components/AppShell";

function MockForm() {
  const [level, setLevel] = useState("Easy");
  const [duration, setDuration] = useState("15");
  const [file, setFile] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  const navigate = useNavigate();

  const startInterview = async () => {
    if (!file) {
      alert("Please upload a job description or resume.");
      return;
    }

    try {
      setIsStarting(true);

      const formData = new FormData();
      formData.append("file", file);

      await axios.post("http://localhost:5000/upload-jd", formData);

      const res = await axios.post("http://localhost:5000/generate-questions", {
        level,
        duration,
      });

      localStorage.setItem("questions", res.data.questions);
      navigate("/interview");
    } catch (error) {
      console.error(error);
      alert("Failed to start interview");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <AppShell className="flex items-center justify-center">
      <div className="grid w-full max-w-5xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="panel-strong rounded-[1.8rem] p-7 md:p-8">
          <span className="eyebrow">Interview setup</span>
          <h1 className="page-heading mt-3">Create a focused mock interview</h1>
          <p className="page-subheading">
            Configure the difficulty, choose a session length, and upload the role context so the
            generated questions stay relevant and realistic.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="panel-soft rounded-[1.3rem] p-4">
              <p className="text-sm muted-copy">Question style</p>
              <p className="mt-2 font-semibold">Role-aware</p>
            </div>
            <div className="panel-soft rounded-[1.3rem] p-4">
              <p className="text-sm muted-copy">Session format</p>
              <p className="mt-2 font-semibold">Written answers</p>
            </div>
            <div className="panel-soft rounded-[1.3rem] p-4">
              <p className="text-sm muted-copy">Best for</p>
              <p className="mt-2 font-semibold">Targeted practice</p>
            </div>
          </div>
        </section>

        <section className="panel rounded-[1.8rem] p-7 md:p-8">
          <div className="space-y-5">
            <div>
              <label className="field-label">Interview level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="field-input">
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div>
              <label className="field-label">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="field-input"
              >
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>

            <div>
              <label className="field-label">Upload job description or resume</label>
              <label className="field-input flex cursor-pointer items-center justify-between gap-3">
                <span className={file ? "text-[var(--text-primary)]" : "subtle-copy"}>
                  {file ? file.name : "Choose a PDF or DOCX file"}
                </span>
                <span className="status-pill status-pill--neutral whitespace-nowrap">Browse</span>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="panel-soft rounded-[1.3rem] p-4">
              <p className="text-sm muted-copy">What happens next</p>
              <ul className="mt-3 space-y-2 text-sm subtle-copy">
                <li>1. Your document is uploaded and used as interview context.</li>
                <li>2. The app generates questions based on your selected difficulty.</li>
                <li>3. You answer each question and get a structured performance report.</li>
              </ul>
            </div>

            <button type="button" onClick={startInterview} className="primary-button w-full" disabled={isStarting}>
              {isStarting ? "Preparing interview..." : "Start interview"}
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default MockForm;
