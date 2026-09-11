const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createFIR,
  checkDuplicateFIR,
  getFIR,
  getMyFIRs,
} = require("../controllers/firController");
const router = express.Router();

router.post("/", protect, createFIR);

router.get("/my", protect, getMyFIRs);
router.post("/check-duplicate", protect, checkDuplicateFIR);

router.get("/:firId", protect, getFIR);

module.exports = router;