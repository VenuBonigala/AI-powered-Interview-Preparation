function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9L5.3 5.3" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 15.2A8.5 8.5 0 0 1 8.8 4 9 9 0 1 0 20 15.2Z" />
    </svg>
  );
}

function ThemeToggle({ theme, onChange }) {
  return (
    <div className="theme-toggle" aria-label="Theme selector">
      <button
        type="button"
        className={`theme-toggle__button ${theme === "light" ? "is-active" : ""}`}
        onClick={() => onChange("light")}
        aria-label="Switch to light theme"
      >
        <SunIcon />
      </button>
      <button
        type="button"
        className={`theme-toggle__button ${theme === "dark" ? "is-active" : ""}`}
        onClick={() => onChange("dark")}
        aria-label="Switch to dark theme"
      >
        <MoonIcon />
      </button>
    </div>
  );
}

export default ThemeToggle;
