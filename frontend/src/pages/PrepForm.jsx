import { useMemo, useState } from "react";
import axios from "axios";
import AppShell from "../components/AppShell";
import { apiUrl } from "../config";

function PrepForm() {
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [file, setFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [plan, setPlan] = useState(JSON.parse(localStorage.getItem("prep_plan") || "null"));
  const [progress, setProgress] = useState(JSON.parse(localStorage.getItem("prep_progress") || "{}"));
  const [streak, setStreak] = useState(Number.parseInt(localStorage.getItem("streak") || "0", 10));

  const evaluation = useMemo(() => JSON.parse(localStorage.getItem("evaluation") || "{}"), []);

  const generatePlan = async () => {
    if (!file) {
      alert("Please upload a job description or resume before generating the plan.");
      return;
    }

    try {
      setIsGenerating(true);

      const formData = new FormData();
      formData.append("file", file);

      await axios.post(apiUrl("/upload-jd"), formData);

      const res = await axios.post(apiUrl("/prep-plan"), {
        days,
        hours,
        weaknesses: evaluation.weaknesses || [],
        improvements: evaluation.improvements || [],
      });

      setPlan(res.data);
      localStorage.setItem("prep_plan", JSON.stringify(res.data));
      setProgress({});
      localStorage.setItem("prep_progress", "{}");
    } catch {
      alert("Unable to generate preparation plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTask = (dayIndex, taskIndex) => {
    const key = `${dayIndex}-${taskIndex}`;
    const updated = {
      ...progress,
      [key]: !progress[key],
    };

    setProgress(updated);
    localStorage.setItem("prep_progress", JSON.stringify(updated));
  };

  const calculateProgress = (tasks, dayIndex) => {
    const done = tasks.filter((_, i) => progress[`${dayIndex}-${i}`]).length;
    return tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    const last = localStorage.getItem("last_completed");

    if (last !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("streak", String(newStreak));
      localStorage.setItem("last_completed", today);
    }
  };

  return (
    <AppShell>
      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="panel-strong rounded-[1.8rem] p-6 md:p-7 self-start">
          <span className="eyebrow">Preparation planner</span>
          <h1 className="page-heading mt-3">Build a clear study roadmap</h1>
          <p className="page-subheading">
            Turn your recent interview feedback into a practical, day-by-day plan with measurable progress.
          </p>

          <div className="mt-8 space-y-4">
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

            <div>
              <label className="field-label">Days available</label>
              <input
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="For example: 7"
                className="field-input"
              />
            </div>

            <div>
              <label className="field-label">Hours per day</label>
              <input
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="For example: 2"
                className="field-input"
              />
            </div>

            <button type="button" onClick={generatePlan} className="primary-button w-full" disabled={isGenerating}>
              {isGenerating ? "Generating plan..." : "Generate plan"}
            </button>
          </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="panel-soft rounded-[1.3rem] p-4">
                <p className="text-sm muted-copy">Current streak</p>
                <p className="metric-value mt-2">{streak}</p>
                <p className="text-sm subtle-copy mt-2">Keep finishing full study days to grow it.</p>
            </div>

            <div className="panel-soft rounded-[1.3rem] p-4">
              <p className="text-sm muted-copy">Focus areas</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(evaluation.weaknesses || []).length ? (
                  evaluation.weaknesses.map((item) => (
                    <span
                      key={item}
                      className="tag text-white"
                      style={{ background: "linear-gradient(135deg, #fb7185, #dc2626)" }}
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-sm subtle-copy">Complete an interview report to personalize the plan.</span>
                )}
              </div>
            </div>

            <div className="panel-soft rounded-[1.3rem] p-4">
              <p className="text-sm muted-copy">Plan inputs</p>
              <p className="mt-2 text-sm subtle-copy">
                We use your uploaded JD or resume together with your interview weaknesses and improvement areas
                to generate the study plan.
              </p>
            </div>
          </div>
        </aside>

        <main className="space-y-4">
          {plan?.days?.length ? (
            plan.days.map((day, dayIndex) => {
              const progressPercent = calculateProgress(day.tasks, dayIndex);
              const allDone = day.tasks.every((_, i) => progress[`${dayIndex}-${i}`]);

              return (
                <section key={dayIndex} className="panel rounded-[1.7rem] p-5 md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold">Day {day.day}</h2>
                      <p className="mt-2 text-sm muted-copy">Assessment focus: {day.assessment}</p>
                    </div>
                    <div className="min-w-[180px] panel-soft rounded-[1.2rem] p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="muted-copy">Completion</span>
                        <span className="font-semibold">{progressPercent}%</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(118,140,196,0.16)]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${progressPercent}%`,
                            background: "linear-gradient(135deg, #72a1ff, #315ef9)",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {day.tasks.map((task, taskIndex) => {
                      const checked = progress[`${dayIndex}-${taskIndex}`] || false;

                      return (
                        <label
                          key={taskIndex}
                          className="panel-soft rounded-[1.2rem] p-4 flex items-start gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTask(dayIndex, taskIndex)}
                            className="mt-1 h-4 w-4 accent-blue-500"
                          />
                          <span className={`text-sm leading-6 ${checked ? "line-through subtle-copy" : ""}`}>
                            {task}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {allDone ? (
                    <button type="button" onClick={updateStreak} className="primary-button mt-5">
                      Mark day complete
                    </button>
                  ) : null}
                </section>
              );
            })
          ) : (
            <section className="panel rounded-[1.8rem] p-8">
              <div className="empty-state py-14">
                Generate a preparation plan to see your daily checklist and progress tracking.
              </div>
            </section>
          )}
        </main>
      </div>
    </AppShell>
  );
}

export default PrepForm;
