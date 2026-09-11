const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createCaseFromFIR,
  getCaseByCaseId,
  analyzeCaseWithAI,
} = require("../controllers/caseController");

const router = express.Router();

router.post("/", protect, createCaseFromFIR);

// Keep this before /:caseId
router.post("/analyze", protect, analyzeCaseWithAI);

router.get("/:caseId", protect, getCaseByCaseId);

module.exports = router;