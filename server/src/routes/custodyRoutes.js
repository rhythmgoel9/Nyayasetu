const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createCustodyLog,
  getCustodyHistory
} = require("../controllers/custodyController");

const router = express.Router();

router.post(
  "/custody",
  protect,
  createCustodyLog
);
router.get("/:evidenceId/custody", protect, getCustodyHistory);
module.exports = router;