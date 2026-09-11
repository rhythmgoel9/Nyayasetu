const FIR = require("../models/FIR");
const Case = require("../models/Case");
const generateCaseId = require("../services/caseIdService");
const { analyzeFIR } = require("../services/aiService");

// ============================================================
// CREATE CASE FROM FIR
// ============================================================

const createCaseFromFIR = async (req, res) => {
  try {
    const { firId } = req.body;

    if (!firId) {
      return res.status(400).json({
        message: "FIR ID is required",
      });
    }

    const fir = await FIR.findById(firId);

    if (!fir) {
      return res.status(404).json({
        message: "FIR not found",
      });
    }

    const existingCase = await Case.findOne({ firId });

    if (existingCase) {
      return res.status(400).json({
        message: "Case already exists for this FIR",
        caseId: existingCase.caseId,
      });
    }

    const caseId = await generateCaseId();

    const aiAnalysis = await analyzeFIR(fir);

    const newCase = await Case.create({
      caseId,
      firId: fir._id,
      citizenId: fir.createdBy,
      jurisdiction: fir.incidentLocation,
      priority: aiAnalysis.severity || "MEDIUM",
      aiAnalysis,
    });

    return res.status(201).json({
      message: "Case created successfully",
      firId: fir._id,
      caseId: newCase.caseId,
    });
  } catch (error) {
    console.error("Case creation failed:", error);

    return res.status(500).json({
      message: "Failed to create case",
      error: error.message,
    });
  }
};

// ============================================================
// GET CASE BY CASE ID
// ============================================================

const getCaseByCaseId = async (req, res) => {
  try {
    const { caseId } = req.params;

    const caseData = await Case.findOne({ caseId }).populate("firId");

    if (!caseData) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    return res.status(200).json({
      case: caseData,
    });
  } catch (error) {
    console.error("Fetching case failed:", error);

    return res.status(500).json({
      message: "Failed to fetch case",
      error: error.message,
    });
  }
};

// ============================================================
// ANALYZE CASE WITH AI
// Supports:
// 1. Real MongoDB cases
// 2. Frontend/mock cases
// ============================================================

const analyzeCaseWithAI = async (req, res) => {
  try {
    const {
      caseId,
      incidentDescription,
      description,
      category,
      type,
      incidentLocation,
      location,
      incidentDate,
      date,
    } = req.body || {};

    if (!caseId && !incidentDescription && !description) {
      return res.status(400).json({
        message: "Case ID or case description is required",
      });
    }

    // ========================================================
    // MODE 1: REAL MONGODB CASE
    // ========================================================

    if (caseId) {
      const existingCase = await Case.findOne({ caseId }).populate("firId");

      if (existingCase) {
        // Return already-saved analysis instead of calling Gemini again
        if (
          existingCase.aiAnalysis &&
          existingCase.aiAnalysis.classification &&
          existingCase.aiAnalysis.classification !== "UNKNOWN"
        ) {
          console.log("Returning saved AI analysis:", caseId);

          return res.status(200).json({
            aiAnalysis: existingCase.aiAnalysis,
            cached: true,
            source: "mongodb",
          });
        }

        const fir = existingCase.firId;

        if (!fir) {
          return res.status(404).json({
            message: "Case exists, but related FIR was not found",
          });
        }

        const aiAnalysis = await analyzeFIR({
          incidentDescription: fir.incidentDescription,
          category: fir.category,
          incidentLocation: fir.incidentLocation,
          incidentDate: fir.incidentDate,
        });

        // Save only successful AI analysis
        if (aiAnalysis.aiAvailable !== false) {
          existingCase.aiAnalysis = aiAnalysis;
          existingCase.priority = aiAnalysis.severity || "MEDIUM";

          await existingCase.save();

          console.log("AI analysis generated and saved:", caseId);
        } else {
          console.log(
            "AI unavailable. MongoDB case was not updated:",
            caseId
          );
        }

        return res.status(200).json({
          aiAnalysis,
          cached: false,
          source: "mongodb",
        });
      }
    }

    // ========================================================
    // MODE 2: FRONTEND / MOCK CASE
    // Used when case is not present in MongoDB
    // ========================================================

    const mockOrFrontendCase = {
      incidentDescription:
        incidentDescription ||
        description ||
        "No description provided",

      category:
        category ||
        type ||
        "General Investigation",

      incidentLocation:
        incidentLocation ||
        location ||
        "Not specified",

      incidentDate:
        incidentDate ||
        date ||
        "Not specified",
    };

    console.log(
      "Analyzing frontend/mock case:",
      caseId || "No case ID"
    );

    const aiAnalysis = await analyzeFIR(mockOrFrontendCase);

    return res.status(200).json({
      aiAnalysis,
      cached: false,
      source: "frontend",
    });
  } catch (error) {
    console.error("Generic AI case analysis failed:", error);

    return res.status(500).json({
      message: "Failed to analyze case",
      error: error.message,
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createCaseFromFIR,
  getCaseByCaseId,
  analyzeCaseWithAI,
};