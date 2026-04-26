import { useState } from "react";
import axios from "axios";

function PrepForm() {
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");

  const [plan, setPlan] = useState(
    JSON.parse(localStorage.getItem("prep_plan") || "null"),
  );

  const [progress, setProgress] = useState(
    JSON.parse(localStorage.getItem("prep_progress") || "{}"),
  );

  const [streak, setStreak] = useState(
    parseInt(localStorage.getItem("streak") || "0"),
  );

  const generatePlan = async () => {
    const evaluation = JSON.parse(localStorage.getItem("evaluation") || "{}");

    try {
      const res = await axios.post("http://localhost:5000/prep-plan", {
        days,
        hours,
        weaknesses: evaluation.weaknesses || [],
        improvements: evaluation.improvements || [],
      });

      setPlan(res.data);
      localStorage.setItem("prep_plan", JSON.stringify(res.data));

      // reset progress when new plan generated
      setProgress({});
      localStorage.setItem("prep_progress", "{}");
    } catch {
      alert("Unable to generate preparation plan");
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
    let done = 0;

    tasks.forEach((_, i) => {
      if (progress[`${dayIndex}-${i}`]) done++;
    });

    return Math.round((done / tasks.length) * 100);
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    const last = localStorage.getItem("last_completed");

    if (last !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);

      localStorage.setItem("streak", newStreak);
      localStorage.setItem("last_completed", today);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Preparation Plan</h2>

      {/* 🔥 STREAK DISPLAY */}
      <h3>🔥 Streak: {streak} days</h3>

      <input
        placeholder="Days"
        value={days}
        onChange={(e) => setDays(e.target.value)}
      />
      <br />

      <input
        placeholder="Hours per day"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
      />
      <br />
      <br />

      <button onClick={generatePlan}>Generate Plan</button>

      {/* PLAN DISPLAY */}
      {plan &&
        plan.days.map((day, dayIndex) => {
          const progressPercent = calculateProgress(day.tasks, dayIndex);

          const allDone = day.tasks.every(
            (_, i) => progress[`${dayIndex}-${i}`],
          );

          return (
            <div
              key={dayIndex}
              style={{
                marginTop: "20px",
                border: "1px solid #ccc",
                padding: "10px",
              }}
            >
              <h3>Day {day.day}</h3>

              <p>
                <b>Progress:</b> {progressPercent}%
              </p>

              {/* TASKS */}
              {day.tasks.map((task, taskIndex) => (
                <div key={taskIndex}>
                  <input
                    type="checkbox"
                    checked={progress[`${dayIndex}-${taskIndex}`] || false}
                    onChange={() => toggleTask(dayIndex, taskIndex)}
                  />
                  {task}
                </div>
              ))}

              {/* ✅ COMPLETE DAY BUTTON */}
              {allDone && (
                <button onClick={updateStreak} style={{ marginTop: "10px" }}>
                  Mark Day Complete ✅
                </button>
              )}

              {/* ASSESSMENT */}
              <div style={{ marginTop: "10px" }}>
                <b>Assessment:</b>
                <p>{day.assessment}</p>
              </div>
            </div>
          );
        })}
    </div>
  );
}

export default PrepForm;
