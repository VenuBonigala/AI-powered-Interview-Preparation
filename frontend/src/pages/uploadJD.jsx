import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function UploadJD() {
  const [jdText, setJdText] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleNext = async () => {
    let finalJD = jdText;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("http://localhost:5000/upload-jd", formData);
      finalJD = res.data.text;
    }

    localStorage.setItem("jd", finalJD);
    navigate("/mode");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload or Paste Job Description</h2>

      <textarea
        rows="8"
        cols="50"
        placeholder="Paste JD here..."
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
      />

      <br />
      <br />

      <input
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br />
      <br />

      <button onClick={handleNext}>Next</button>
    </div>
  );
}

export default UploadJD;
