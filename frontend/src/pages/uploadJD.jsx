import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ScoreGauge from "../components/ScoreGauge";
import AppShell from "../components/AppShell";

function UploadJD() {
  const navigate = useNavigate();

  const evaluation = JSON.parse(localStorage.getItem("evaluation") || "{}");
  const plan = JSON.parse(localStorage.getItem("prep_plan") || "null");
  const streak = Number.parseInt(localStorage.getItem("streak") || "0", 10);

  const skills = evaluation.skills || {};
  const skillData = Object.keys(skills).map((key) => ({
    skill: key,
    score: skills[key],
  }));

  const strengths = evaluation.strengths || [];
  const weaknesses = evaluation.weaknesses || [];

  const navCards = [
    {
      title: "Continue your plan",
      description: plan
        ? "Pick up where you left off and keep your momentum steady."
        : "Create a study plan tailored to your latest interview gaps.",
      action: plan ? "Continue plan" : "Create plan",
      meta: `${streak} day streak`,
      onClick: () => navigate("/prep"),
    },
    {
      title: "Mock interview",
      description: "Upload a role-specific document and generate guided practice questions.",
      action: "Start interview",
      meta: "Role-based questions",
      onClick: () => navigate("/mock"),
    },
    {
      title: "Performance report",
      description: evaluation.overall_score
        ? "Review your latest strengths, weaknesses, and improvement areas."
        : "Finish a mock interview to unlock your first performance report.",
      action: evaluation.overall_score ? "Open report" : "View after interview",
      meta: evaluation.overall_score ? "Latest insights ready" : "No completed report yet",
      onClick: () => navigate("/report"),
    },
  ];

  return (
    <AppShell>
      <div className="panel rounded-[2rem] p-4 md:p-6">
        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="panel-strong rounded-[1.6rem] p-5 flex flex-col justify-between">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-[var(--button-secondary)] flex items-center justify-center text-lg font-semibold">
                  AI
                </div>
                <div>
                  <p className="text-sm muted-copy">Workspace</p>
                  <p className="font-semibold">Interview Console</p>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  ["Dashboard", "/"],
                  ["Interview", "/mock"],
                  ["Preparation", "/prep"],
                  ["Reports", "/report"],
                ].map(([label, path]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => navigate(path)}
                    className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                      path === "/"
                        ? "bg-[var(--button-secondary)] text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--button-secondary)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="panel-soft rounded-[1.3rem] p-4">
              <p className="text-sm muted-copy">Readiness score</p>
              <p className="metric-value mt-2">{evaluation.overall_score || "--"}</p>
              <p className="text-sm subtle-copy mt-2">Based on your most recent mock interview.</p>
            </div>
          </aside>

          <main className="space-y-5">
            <section className="panel-strong rounded-[1.7rem] p-6 md:p-8">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-2xl">
                  <span className="eyebrow">Professional mock interview workflow</span>
                  <h1 className="page-heading mt-3">Welcome back, Venu</h1>
                  <p className="page-subheading">
                    Track interview readiness, focus your preparation, and keep every practice session
                    aligned with the job description you are targeting.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:w-[360px]">
                  <div className="panel-soft rounded-[1.3rem] p-4">
                    <p className="text-sm muted-copy">Current streak</p>
                    <p className="metric-value mt-2">{streak}</p>
                    <p className="text-sm subtle-copy mt-2">Days of consistent preparation</p>
                  </div>
                  <div className="panel-soft rounded-[1.3rem] p-4">
                    <p className="text-sm muted-copy">Plan status</p>
                    <p className="mt-2 text-lg font-semibold">{plan ? "Active" : "Not started"}</p>
                    <p className="text-sm subtle-copy mt-2">
                      {plan ? `${plan.days?.length || 0} scheduled days` : "Generate a plan after your report"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
              <div className="space-y-4">
                {navCards.map((card) => (
                  <div key={card.title} className="panel-strong rounded-[1.5rem] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold">{card.title}</h2>
                        <p className="mt-2 text-sm muted-copy leading-6">{card.description}</p>
                      </div>
                      <span className="status-pill status-pill--neutral whitespace-nowrap">{card.meta}</span>
                    </div>
                    <button type="button" onClick={card.onClick} className="primary-button mt-5 w-full">
                      {card.action}
                    </button>
                  </div>
                ))}
              </div>

              <div className="panel-strong rounded-[1.5rem] p-5 md:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Skills overview</h2>
                    <p className="mt-2 text-sm muted-copy">
                      A quick look at the capabilities captured from your latest evaluation.
                    </p>
                  </div>
                  <div className="status-pill status-pill--neutral">10 point scale</div>
                </div>

                <div className="mt-6 h-[320px] w-full">
                  {skillData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={skillData} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(132, 153, 207, 0.16)" vertical={false} />
                        <XAxis dataKey="skill" stroke="var(--text-secondary)" tickLine={false} axisLine={false} />
                        <YAxis
                          domain={[0, 10]}
                          stroke="var(--text-secondary)"
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(112, 142, 231, 0.08)" }}
                          contentStyle={{
                            borderRadius: "16px",
                            border: "1px solid var(--border)",
                            background: "var(--panel-strong)",
                            color: "var(--text-primary)",
                          }}
                        />
                        <Bar dataKey="score" fill="url(#skillsGradient)" radius={[12, 12, 4, 4]} />
                        <defs>
                          <linearGradient id="skillsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#72a1ff" />
                            <stop offset="100%" stopColor="#2d53d7" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="empty-state h-full flex items-center justify-center">
                      Finish a mock interview to populate this analytics view.
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <div className="panel-strong rounded-[1.5rem] p-5">
                <h2 className="text-lg font-semibold">Strengths</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {strengths.length ? (
                    strengths.map((item) => (
                      <span
                        key={item}
                        className="tag text-white"
                        style={{ background: "linear-gradient(135deg, #34d399, #0f9d88)" }}
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <p className="subtle-copy text-sm">Your strongest areas will appear here after an interview.</p>
                  )}
                </div>
              </div>

              <div className="panel-strong rounded-[1.5rem] p-5">
                <h2 className="text-lg font-semibold">Weaknesses</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {weaknesses.length ? (
                    weaknesses.map((item) => (
                      <span
                        key={item}
                        className="tag text-white"
                        style={{ background: "linear-gradient(135deg, #fb7185, #dc2626)" }}
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <p className="subtle-copy text-sm">Improvement areas will show up here once feedback is available.</p>
                  )}
                </div>
              </div>

              <div className="panel-strong rounded-[1.5rem] p-5 flex flex-col items-center justify-center">
                <p className="text-sm muted-copy">Recent interview score</p>
                <div className="mt-2">
                  <ScoreGauge score={evaluation.overall_score || 0} size={150} stroke={14} />
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </AppShell>
  );
}

export default UploadJD;
