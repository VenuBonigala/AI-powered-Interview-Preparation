function ScoreGauge({ score = 0, size = 180, stroke = 16 }) {
  const value = Number.parseFloat(score) || 0;
  const bounded = Math.max(0, Math.min(10, value));
  const percentage = bounded / 10;

  const radius = size / 2;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - percentage * circumference;

  const color =
    bounded >= 8
      ? "var(--success)"
      : bounded >= 5
        ? "var(--warning)"
        : "var(--danger)";

  return (
    <div className="flex items-center justify-center">
      <svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="48%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>

        <circle
          stroke="rgba(108, 131, 193, 0.28)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        <circle
          stroke="url(#scoreGradient)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />

        <text
          x="50%"
          y="47%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill={color}
          fontSize={size * 0.2}
          fontWeight="700"
        >
          {bounded.toFixed(1)}
        </text>

        <text
          x="50%"
          y="61%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="var(--text-muted)"
          fontSize={size * 0.07}
          fontWeight="500"
        >
          Out of 10
        </text>
      </svg>
    </div>
  );
}

export default ScoreGauge;
