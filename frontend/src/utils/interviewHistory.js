const INTERVIEW_HISTORY_KEY = "interview_history";

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeSkillName(skill) {
  const raw = String(skill || "").trim();

  if (!raw) return "";

  const acronymMap = {
    ai: "AI",
    ml: "ML",
    llm: "LLM",
    rag: "RAG",
    nlp: "NLP",
    api: "API",
    sql: "SQL",
    nosql: "NoSQL",
    aws: "AWS",
    gcp: "GCP",
    ui: "UI",
    ux: "UX",
    ci: "CI",
    cd: "CD",
  };

  return raw
    .split(/(?:\s|\/|\+|-)+/)
    .filter(Boolean)
    .map((part) => {
      const lowered = part.toLowerCase();
      return acronymMap[lowered] || `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`;
    })
    .join(" ");
}

export function getInterviewHistory() {
  const parsed = safeJsonParse(localStorage.getItem(INTERVIEW_HISTORY_KEY), []);
  return Array.isArray(parsed) ? parsed : [];
}

export { safeJsonParse };

export function buildInterviewSignature({ questions = [], answers = [] }) {
  return JSON.stringify({
    questions: questions.map((item) => String(item || "").trim()),
    answers: answers.map((item) => String(item || "").trim()),
  });
}

export function saveInterviewToHistory({ evaluation, questions = [], answers = [] }) {
  if (!evaluation || typeof evaluation !== "object") return;

  const signature = buildInterviewSignature({ questions, answers });
  if (!signature || signature === '{"questions":[],"answers":[]}') return;

  const normalizedSkills = Object.entries(evaluation.skills || {}).reduce((acc, [skill, score]) => {
    const name = normalizeSkillName(skill);
    const numericScore = Number.parseFloat(score);

    if (!name || Number.isNaN(numericScore)) return acc;

    acc[name] = Math.max(0, Math.min(10, numericScore));
    return acc;
  }, {});

  const history = getInterviewHistory();
  const existingIndex = history.findIndex((entry) => entry.signature === signature);

  const nextEntry = {
    signature,
    createdAt: new Date().toISOString(),
    overallScore: evaluation.overall_score || null,
    skills: normalizedSkills,
    questions,
  };

  if (existingIndex >= 0) {
    history[existingIndex] = {
      ...history[existingIndex],
      ...nextEntry,
      createdAt: history[existingIndex].createdAt || nextEntry.createdAt,
    };
  } else {
    history.push(nextEntry);
  }

  localStorage.setItem(INTERVIEW_HISTORY_KEY, JSON.stringify(history));
}

export function buildAggregatedSkillData(limit = 8) {
  const history = getInterviewHistory();
  const aggregate = new Map();

  history.forEach((entry) => {
    Object.entries(entry.skills || {}).forEach(([skill, score]) => {
      if (!aggregate.has(skill)) {
        aggregate.set(skill, {
          skill,
          totalScore: 0,
          appearances: 0,
          bestScore: 0,
          latestScore: 0,
        });
      }

      const current = aggregate.get(skill);
      current.totalScore += score;
      current.appearances += 1;
      current.bestScore = Math.max(current.bestScore, score);
      current.latestScore = score;
    });
  });

  return Array.from(aggregate.values())
    .map((item) => ({
      skill: item.skill,
      score: Number((item.totalScore / item.appearances).toFixed(1)),
      appearances: item.appearances,
      bestScore: item.bestScore,
      latestScore: item.latestScore,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.appearances !== a.appearances) return b.appearances - a.appearances;
      return a.skill.localeCompare(b.skill);
    })
    .slice(0, limit);
}

function toNumericScore(rawScore) {
  const value = Number.parseFloat(rawScore);
  if (Number.isNaN(value)) return null;
  return Math.max(0, Math.min(10, value));
}

export function getAverageInterviewScore() {
  const history = getInterviewHistory();

  const scores = history
    .map((entry) => toNumericScore(entry?.overallScore))
    .filter((score) => score !== null);

  if (!scores.length) {
    return null;
  }

  const total = scores.reduce((sum, score) => sum + score, 0);
  return Number((total / scores.length).toFixed(1));
}
