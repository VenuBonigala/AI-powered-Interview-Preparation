const express = require('express');
const cors = require('cors');
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const axios = require("axios");
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const AI_SERVICE_BASE_URL = (process.env.AI_SERVICE_BASE_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
const upload = multer({ dest: "uploads/" });

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
      res.send("Backend is running");
});

function aiServiceUrl(path) {
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      return `${AI_SERVICE_BASE_URL}${normalizedPath}`;
}

app.post("/upload-jd", upload.single("file"), async (req, res) => {
      try {
            const filePath = req.file.path;
            let text = "";

            if (req.file.mimetype === "application/pdf") {
                  const data = await pdfParse(fs.readFileSync(filePath));
                  text = data.text;
            } else if (
                  req.file.mimetype ===
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ) {
                  const result = await mammoth.extractRawText({ path: filePath });
                  text = result.value;
            } else {
                  return res.status(400).json({ error: "Unsupported file type" });
            }

            await axios.post(aiServiceUrl("/store-jd"), { text });

            res.json({ text });

      } catch {
            res.status(500).json({ error: "File processing failed" });
      }
});

app.post("/generate-questions", async (req, res) => {
      try {
            const { level, duration } = req.body;

            const response = await axios.post(aiServiceUrl("/generate-questions"), {
                  level,
                  duration
            });

            res.json(response.data);

      } catch {
            res.status(500).json({ error: "Failed to generate questions" });
      }
});

app.post("/ideal-answer", async (req, res) => {
      try {
            const { question } = req.body;

            const response = await axios.post(aiServiceUrl("/ideal-answer"), {
                  question
            });

            res.json(response.data);

      } catch {
            res.status(500).json({ error: "Failed to generate ideal answer" });
      }
});

app.post("/evaluate", async (req, res) => {
      try {
            const { questions, answers, ideals } = req.body;

            const response = await axios.post(aiServiceUrl("/evaluate"), {
                  questions,
                  answers,
                  ideals
            });

            res.json(response.data);

      } catch {
            res.status(500).json({ error: "Evaluation failed" });
      }
});


app.post("/prep-plan", async (req, res) => {
      try {
            const { days, hours, weaknesses, improvements } = req.body;

            const response = await axios.post(aiServiceUrl("/prep-plan"), {
                  days,
                  hours,
                  weaknesses,
                  improvements
            });

            res.json(response.data);

      } catch {
            res.status(500).json({ error: "Prep plan failed" });
      }
});

app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
});
