import express from "express";
import cors from "cors";
import { analyzeCase } from "./ai/caseAnalyzer.js";

const app = express();

const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post("/api/ai/analyze-case", async (req, res) => {
  try {
    const caseData = req.body;

    if (!caseData || Object.keys(caseData).length === 0) {
      return res.status(400).json({
        error: "Case data is required",
      });
    }

    const result = await analyzeCase(caseData);

    res.json(result);
  } catch (error) {
    console.error("AI analysis error:", error);

    res.status(500).json({
      error: "Failed to analyze case",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`);
});