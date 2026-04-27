function AppShell({ children, className = "" }) {
  return (
    <div className="app-shell">
      <div className={`content-wrap ${className}`.trim()}>{children}</div>
    </div>
  );
}

export default AppShell;
