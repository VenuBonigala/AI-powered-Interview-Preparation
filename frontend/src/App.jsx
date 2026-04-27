import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import ThemeToggle from "./components/ThemeToggle";
import UploadJD from "./pages/uploadJD";
import PrepForm from "./pages/PrepForm";
import MockForm from "./pages/MockForm";
import Interview from "./pages/Interview";
import Report from "./pages/Report";

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
      <ThemeToggle theme={theme} onChange={setTheme} />
      <Routes>
        <Route path="/" element={<UploadJD />} />
        <Route path="/prep" element={<PrepForm />} />
        <Route path="/mock" element={<MockForm />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </>
  );
}

export default App;
