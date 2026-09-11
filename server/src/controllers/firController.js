
const FIR = require("../models/FIR");

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");

const getMeaningfulWords = (value) => {
  const ignoredWords = new Set([
    "the",
    "a",
    "an",
    "my",
    "is",
    "was",
    "were",
    "near",
    "at",
    "on",
    "in",
    "of",
    "to",
    "and",
    "from",
  ]);

  return normalizeText(value)
    .split(" ")
    .filter((word) => word.length >= 3 && !ignoredWords.has(word));
};

const findDuplicateFIR = async ({
  userId,
  incidentDescription,
  incidentDate,
  incidentLocation,
  category,
}) => {
  const normalizedDescription = normalizeText(incidentDescription);
  const normalizedLocation = normalizeText(incidentLocation);
  const normalizedCategory = normalizeText(category);

  const startOfDay = new Date(incidentDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(incidentDate);
  endOfDay.setHours(23, 59, 59, 999);

  const userFIRs = await FIR.find({
    createdBy: userId,
    incidentDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  const exactDuplicate = userFIRs.find((existing) => {
    return (
      normalizeText(existing.incidentDescription) ===
        normalizedDescription &&
      normalizeText(existing.incidentLocation) === normalizedLocation &&
      normalizeText(existing.category) === normalizedCategory
    );
  });

  if (exactDuplicate) {
    return {
      type: "EXACT",
      fir: exactDuplicate,
    };
  }

  const possibleDuplicate = userFIRs.find((existing) => {
    const sameLocation =
      normalizeText(existing.incidentLocation) === normalizedLocation;

    const sameCategory =
      normalizeText(existing.category) === normalizedCategory;

    if (!sameLocation || !sameCategory) {
      return false;
    }

    const oldWords = new Set(
      getMeaningfulWords(existing.incidentDescription)
    );

    const newWords = getMeaningfulWords(incidentDescription);

    if (newWords.length === 0) {
      return false;
    }

    const matchingWords = newWords.filter((word) =>
      oldWords.has(word)
    );

    const similarityRatio =
      matchingWords.length / Math.max(oldWords.size, newWords.length);

    return similarityRatio >= 0.5;
  });

  if (possibleDuplicate) {
    return {
      type: "POSSIBLE",
      fir: possibleDuplicate,
    };
  }

  return {
    type: "NONE",
    fir: null,
  };
};

const createFIR = async (req, res) => {
  try {
    const {
      firNumber,
      complainant,
      incidentDescription,
      incidentDate,
      incidentLocation,
      category,
      forceSubmit = false,
    } = req.body;

    if (
      !firNumber ||
      !complainant ||
      !incidentDescription ||
      !incidentDate ||
      !incidentLocation ||
      !category
    ) {
      return res.status(400).json({
        message: "Please provide all FIR details",
      });
    }

    const existingFIRNumber = await FIR.findOne({
      firNumber: firNumber.trim(),
    });

    if (existingFIRNumber) {
      return res.status(409).json({
        message: "FIR number already exists",
      });
    }

    const duplicateResult = await findDuplicateFIR({
      userId: req.user.userId,
      incidentDescription,
      incidentDate,
      incidentLocation,
      category,
    });

    if (duplicateResult.type === "EXACT") {
      return res.status(409).json({
        message: "A duplicate FIR already exists for this incident",
        existingFirId: duplicateResult.fir._id,
        existingFirNumber: duplicateResult.fir.firNumber,
      });
    }

    if (duplicateResult.type === "POSSIBLE" && !forceSubmit) {
      return res.status(200).json({
        message:
          "A potentially similar FIR already exists. Please verify before submitting.",
        possibleDuplicate: true,
        requiresConfirmation: true,
        existingFirId: duplicateResult.fir._id,
        existingFirNumber: duplicateResult.fir.firNumber,
      });
    }

    const fir = await FIR.create({
      firNumber: firNumber.trim(),
      complainant: complainant.trim(),
      incidentDescription: incidentDescription.trim(),
      incidentDate,
      incidentLocation: incidentLocation.trim(),
      category: category.trim(),
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      message: "FIR created successfully",
      fir,
    });
  } catch (error) {
    console.error("FIR creation failed:", error);

    return res.status(500).json({
      message: "Failed to create FIR",
      error: error.message,
    });
  }
};

const checkDuplicateFIR = async (req, res) => {
  try {
    const {
      incidentDescription,
      incidentDate,
      incidentLocation,
      category,
    } = req.body;

    if (
      !incidentDescription ||
      !incidentDate ||
      !incidentLocation ||
      !category
    ) {
      return res.status(400).json({
        message:
          "incidentDescription, incidentDate, incidentLocation and category are required",
      });
    }

    const duplicateResult = await findDuplicateFIR({
      userId: req.user.userId,
      incidentDescription,
      incidentDate,
      incidentLocation,
      category,
    });

    if (duplicateResult.type === "EXACT") {
      return res.status(200).json({
        duplicate: true,
        type: "EXACT",
        message: "An exact duplicate FIR already exists",
        existingFirId: duplicateResult.fir._id,
        existingFirNumber: duplicateResult.fir.firNumber,
      });
    }

    if (duplicateResult.type === "POSSIBLE") {
      return res.status(200).json({
        duplicate: true,
        type: "POSSIBLE",
        requiresConfirmation: true,
        message: "A potentially similar FIR exists",
        existingFirId: duplicateResult.fir._id,
        existingFirNumber: duplicateResult.fir.firNumber,
      });
    }

    return res.status(200).json({
      duplicate: false,
      type: "NONE",
      message: "No duplicate FIR found",
    });
  } catch (error) {
    console.error("Duplicate FIR check failed:", error);

    return res.status(500).json({
      message: "Failed to check duplicate FIR",
      error: error.message,
    });
  }
};

const getFIR = async (req, res) => {
  try {
    const fir = await FIR.findById(req.params.firId)
      .populate("createdBy", "name email role");

    if (!fir) {
      return res.status(404).json({
        message: "FIR not found",
      });
    }

    res.status(200).json({
      fir,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch FIR",
      error: error.message,
    });
  }
};

const getMyFIRs = async (req, res) => {
  try {
    const firs = await FIR.find({
      createdBy: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: firs.length,
      firs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch FIRs",
      error: error.message,
    });
  }
};

module.exports = {
  createFIR,
  checkDuplicateFIR,
  getFIR,
  getMyFIRs,
};

