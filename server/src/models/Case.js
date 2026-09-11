const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      unique: true,
      required: true,
    },

    firId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FIR",
      required: true,
      unique: true,
    },

    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "CREATED",
        "ASSIGNED",
        "INVESTIGATION",
        "COURT",
        "CLOSED",
      ],
      default: "CREATED",
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    jurisdiction: {
      type: String,
      default: null,
    },
    aiAnalysis: {
      classification: {
        type: String,
        default: null,
      },
      confidence: {
        type: Number,
        default: null,
      },
      summary: {
        type: String,
        default: null,
      },
      severity: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"],
        default: null,
      },
      reasoning: {
        type: String,
        default: null,
      },
      keywords: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Case", caseSchema);