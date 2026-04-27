import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { apiUrl } from "../config";

function Interview() {
  const navigate = useNavigate();

  const questions = useMemo(() => {
    const raw = localStorage.getItem("questions");

    try {
      return JSON.parse(raw || "[]");
    } catch {
      return (raw || "")
        .replace("[", "")
        .replace("]", "")
        .split(",")
        .map((q) => q.trim().replace(/"/g, ""))
        .filter(Boolean);
    }
  }, []);

  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [ideals, setIdeals] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = questions.length ? Math.round(((current + 1) / questions.length) * 100) : 0;

  const handleNext = async () => {
    const currentQuestion = questions[current];

    if (!currentQuestion) {
      navigate("/mock");
      return;
    }

    try {
      setIsSubmitting(true);

      const updatedAnswers = [...answers, answer];
      let idealAnswer = "";

      try {
        const res = await fetch(apiUrl("/ideal-answer"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: currentQuestion }),
        });

        const data = await res.json();
        idealAnswer = data.ideal || "";
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!questions.length) {
    return (
      <AppShell className="flex items-center justify-center">
        <div className="panel rounded-[1.8rem] p-8 max-w-xl text-center">
          <h1 className="page-heading">No active interview</h1>
          <p className="page-subheading">Start a new mock interview to generate your question set.</p>
          <button type="button" onClick={() => navigate("/mock")} className="primary-button mt-6">
            Go to setup
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell className="flex items-center justify-center">
      <div className="grid w-full max-w-6xl gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="panel-strong rounded-[1.8rem] p-6">
          <span className="eyebrow">Live session</span>
          <h1 className="text-2xl font-semibold mt-3">Mock interview</h1>
          <p className="mt-3 text-sm muted-copy leading-6">
            Answer each question clearly and keep your examples specific to the role you uploaded.
          </p>

          <div className="mt-8 panel-soft rounded-[1.4rem] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="muted-copy">Progress</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(118,140,196,0.16)]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(135deg, #72a1ff, #315ef9)",
                }}
              />
            </div>
            <p className="mt-3 text-sm subtle-copy">
              Question {current + 1} of {questions.length}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {questions.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className={`rounded-[1.1rem] border px-4 py-3 text-sm ${
                  index === current
                    ? "border-[rgba(123,152,255,0.42)] bg-[var(--button-secondary)]"
                    : "border-[var(--border)] bg-transparent text-[var(--text-secondary)]"
                }`}
              >
                Question {index + 1}
              </div>
            ))}
          </div>
        </aside>

        <main className="panel rounded-[1.8rem] p-6 md:p-8">
          <div className="panel-soft rounded-[1.5rem] p-5">
            <p className="text-sm muted-copy">Current question</p>
            <h2 className="mt-3 text-2xl font-semibold leading-9">{questions[current]}</h2>
          </div>

          <div className="mt-5">
            <label className="field-label">Your answer</label>
            <textarea
              rows="10"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type a clear, structured answer. Mention context, your approach, and the outcome."
              className="field-input min-h-[280px] resize-y"
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm subtle-copy">
              Aim for concise, evidence-based answers that reflect your actual experience.
            </p>
            <button type="button" onClick={handleNext} className="primary-button sm:min-w-[220px]" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving response..."
                : current + 1 === questions.length
                  ? "Finish interview"
                  : "Next question"}
            </button>
          </div>
        </main>
      </div>
    </AppShell>
  );
}

export default Interview;
