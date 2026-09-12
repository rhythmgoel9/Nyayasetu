import "dotenv/config";
import express from "express";
import cors from "cors";
import { getAnalytics, addCaseForAnalytics, getCaseAI } from "./analyticsController.js";

const app = express();

const PORT = Number(process.env.PORT || 5000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

const allowedOrigins = FRONTEND_ORIGIN
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked request from origin: ${origin}`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "nyayasetu-server",
    voiceFIR: "browser-speech-recognition",
  });
});

app.get("/api/v1/analytics", getAnalytics);
app.post("/api/v1/analytics/cases", addCaseForAnalytics);
app.get("/api/v1/analytics/cases/:caseId/ai", getCaseAI);

// Voice FIR transcription is performed in the browser with SpeechRecognition.
// No audio is uploaded to this backend and no API key is required.
app.get("/api/v1/voice/health", (req, res) => {
  res.json({
    success: true,
    service: "voice-fir",
    mode: "browser-speech-recognition",
    apiKeyRequired: false,
  });
});

app.use((error, req, res, next) => {
  console.error("[server]", error);

  if (error?.message?.startsWith("CORS blocked")) {
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

app.listen(PORT, () => {
  console.log(`NyayaSetu backend running on http://localhost:${PORT}`);
  console.log("Voice FIR: browser-based SpeechRecognition (no API key required)");
});
