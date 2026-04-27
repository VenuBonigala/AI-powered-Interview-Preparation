import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppShell from "../components/AppShell";
import ScoreGauge from "../components/ScoreGauge";
import { saveInterviewToHistory, safeJsonParse } from "../utils/interviewHistory";
import { apiUrl } from "../config";

function getQuestionTag(question = "") {
  if (question.includes("RAG")) return "RAG";
  if (question.includes("API")) return "Backend";
  if (question.includes("React")) return "Frontend";
  return "General";
}

function getScoreTone(score) {
  const value = Number.parseFloat(score) || 0;

  if (value >= 8) {
    return {
      label: "Strong",
      className: "status-pill status-pill--success",
    };
  }

  if (value >= 5) {
    return {
      label: "Average",
      className: "status-pill status-pill--warning",
    };
  }

  return {
    label: "Needs work",
    className: "status-pill status-pill--danger",
  };
}

function Report() {
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(
    safeJsonParse(localStorage.getItem("evaluation"), null),
  );
  const [isLoading, setIsLoading] = useState(!evaluation);

  const questions = useMemo(() => safeJsonParse(localStorage.getItem("questions"), []), []);
  const answers = useMemo(() => safeJsonParse(localStorage.getItem("answers"), []), []);
  const ideals = useMemo(() => safeJsonParse(localStorage.getItem("ideals"), []), []);

  useEffect(() => {
    const fetchEvaluation = async () => {
      if (evaluation || !questions.length) return;

      try {
        const res = await axios.post(apiUrl("/evaluate"), {
          questions,
          answers,
          ideals,
        });

        const parsed = JSON.parse(res.data.evaluation);
        setEvaluation(parsed);
        localStorage.setItem("evaluation", JSON.stringify(parsed));
        saveInterviewToHistory({ evaluation: parsed, questions, answers });
      } catch {
        setEvaluation(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluation();
  }, [answers, evaluation, ideals, questions]);

  useEffect(() => {
    if (evaluation) {
      saveInterviewToHistory({ evaluation, questions, answers });
    }
  }, [answers, evaluation, questions]);

  if (isLoading) {
    return (
      <AppShell className="flex items-center justify-center">
        <div className="panel rounded-[1.8rem] p-8 text-center">
          <h1 className="page-heading">Generating your report</h1>
          <p className="page-subheading">We are evaluating your answers and organizing the feedback.</p>
        </div>
      </AppShell>
    );
  }

  if (!evaluation) {
    return (
      <AppShell className="flex items-center justify-center">
        <div className="panel rounded-[1.8rem] p-8 text-center">
          <h1 className="page-heading">No report available</h1>
          <p className="page-subheading">Complete a mock interview first so we can build your evaluation.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <section className="panel rounded-[1.8rem] p-6 md:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-center">
            <div>
              <span className="eyebrow">Interview performance report</span>
              <div className="mt-4"></div>
              <h1 className="page-heading mt-3">
                Clear feedback, organized for action
              </h1>
              <p className="page-subheading">
                Review your overall interview readiness, question-level
                feedback, and the specific areas worth strengthening before your
                next round.
              </p>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="secondary-button mt-2"
              >
                Home
              </button>
            </div>

            <div className="panel-strong rounded-[1.6rem] p-5 flex flex-col items-center justify-center">
              <p className="text-sm muted-copy">Overall score</p>
              <ScoreGauge
                score={evaluation.overall_score || 0}
                size={170}
                stroke={15}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="panel-strong rounded-[1.5rem] p-5">
            <h2 className="text-lg font-semibold">Strengths</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 muted-copy">
              {(evaluation.strengths || []).length ? (
                evaluation.strengths.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))
              ) : (
                <li>No strengths captured yet.</li>
              )}
            </ul>
          </div>

          <div className="panel-strong rounded-[1.5rem] p-5">
            <h2 className="text-lg font-semibold">Weaknesses</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 muted-copy">
              {(evaluation.weaknesses || []).length ? (
                evaluation.weaknesses.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))
              ) : (
                <li>No weaknesses captured yet.</li>
              )}
            </ul>
          </div>

          <div className="panel-strong rounded-[1.5rem] p-5">
            <h2 className="text-lg font-semibold">Improvements</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 muted-copy">
              {(evaluation.improvements || []).length ? (
                evaluation.improvements.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))
              ) : (
                <li>No improvements captured yet.</li>
              )}
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          {(evaluation.question_wise || []).map((item, index) => {
            const tone = getScoreTone(item.score);
            const feedbackParts = String(item.feedback || "")
              .split(",")
              .map((part) => part.trim())
              .filter(Boolean);

            return (
              <article
                key={index}
                className="panel rounded-[1.6rem] p-5 md:p-6"
              >
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_160px] xl:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className="tag text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, #72a1ff, #315ef9)",
                        }}
                      >
                        {getQuestionTag(questions[index])}
                      </span>
                      <span className={tone.className}>{tone.label}</span>
                    </div>

                    <h2 className="mt-4 text-xl font-semibold leading-8">
                      Question {index + 1}: {questions[index]}
                    </h2>

                    <div className="mt-5 grid gap-3">
                      {feedbackParts.length ? (
                        feedbackParts.map((part, partIndex) => (
                          <div
                            key={partIndex}
                            className="panel-soft rounded-[1.2rem] p-4 text-sm leading-6 muted-copy"
                          >
                            {part}
                          </div>
                        ))
                      ) : (
                        <div className="panel-soft rounded-[1.2rem] p-4 text-sm leading-6 muted-copy">
                          Feedback is not available for this answer yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="panel-soft rounded-[1.3rem] p-3 flex items-center justify-center">
                    <ScoreGauge score={item.score} size={130} stroke={12} />
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}

export default Report;
