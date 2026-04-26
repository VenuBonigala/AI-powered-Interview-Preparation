import { Routes, Route } from "react-router-dom";
import UploadJD from "./pages/UploadJD";
import ChooseMode from "./pages/ChooseMode";
import PrepForm from "./pages/PrepForm";
import MockForm from "./pages/MockForm";
import Interview from "./pages/Interview";
import Report from "./pages/Report";

function App() {
  return (
    <Routes>
      <Route path="/" element={<UploadJD />} />
      <Route path="/mode" element={<ChooseMode />} />
      <Route path="/prep" element={<PrepForm />} />
      <Route path="/mock" element={<MockForm />} />
      <Route path="/interview" element={<Interview />} />
      <Route path="/report" element={<Report />} />
    </Routes>
  );
}

export default App;
