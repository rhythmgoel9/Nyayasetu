const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const Evidence = require("../models/Evidence");
const DigitalSignature = require("../models/DigitalSignature");

const signEvidence = async (req, res) => {
  try {
    const { evidenceId } = req.params;

    // Check whether evidence exists
    const evidence = await Evidence.findOne({ evidenceId });

    if (!evidence) {
      return res.status(404).json({
        message: "Evidence not found",
      });
    }

    // Check whether signature image was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "Signature image is required",
      });
    }

    // Check whether user is authorized to sign
    const allowedRoles = [
      "POLICE",
      "INVESTIGATING_AGENCY",
      "COURT",
    ];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You are not authorized to sign evidence",
      });
    }

    // Check if evidence is already signed
    const existingSignature = await DigitalSignature.findOne({
      evidenceId,
    });

    if (existingSignature) {
      return res.status(400).json({
        message: "Evidence has already been signed",
      });
    }

    // Check whether the original evidence file still exists
    const evidenceFilePath = path.resolve(evidence.filePath);

    if (!fs.existsSync(evidenceFilePath)) {
      return res.status(404).json({
        message: "Evidence file not found",
      });
    }

    // Recalculate the evidence hash
    const fileBuffer = fs.readFileSync(evidenceFilePath);

    const currentHash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    // Do not sign modified evidence
    if (currentHash !== evidence.fileHash) {
      return res.status(409).json({
        message: "Evidence has been modified and cannot be signed",
      });
    }

    // Read private signing key
    const privateKeyPath = path.join(
      __dirname,
      "../../keys/private.pem"
    );

    if (!fs.existsSync(privateKeyPath)) {
      return res.status(500).json({
        message: "Signing key not found",
      });
    }

    const privateKey = fs.readFileSync(
      privateKeyPath,
      "utf8"
    );

    // Create data that will be digitally signed
    const dataToSign =
      `${evidence.evidenceId}:${evidence.fileHash}`;

    // Create cryptographic signature
    const signer = crypto.createSign("SHA256");

    signer.update(dataToSign);
    signer.end();

    const digitalSignature = signer.sign(
      privateKey,
      "base64"
    );

    // Save signature information
    const signatureRecord = await DigitalSignature.create({
      evidenceId: evidence.evidenceId,
      evidenceHash: evidence.fileHash,
      signatureImage: req.file.path,
      signedBy: req.user.userId,
      signedAt: new Date(),
      digitalSignature,
      verificationStatus: "VALID",
    });

    res.status(201).json({
      message: "Evidence signed successfully",

      signature: {
        evidenceId: signatureRecord.evidenceId,
        evidenceHash: signatureRecord.evidenceHash,
        signatureImage: signatureRecord.signatureImage,
        signedBy: signatureRecord.signedBy,
        signedAt: signatureRecord.signedAt,
        verificationStatus: signatureRecord.verificationStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to sign evidence",
      error: error.message,
    });
  }
};
const verifySignature = async (req, res) => {
  try {
    const { evidenceId } = req.params;

    // Find evidence
    const evidence = await Evidence.findOne({ evidenceId });

    if (!evidence) {
      return res.status(404).json({
        message: "Evidence not found",
      });
    }

    // Find digital signature
    const signature = await DigitalSignature.findOne({
      evidenceId,
    });

    if (!signature) {
      return res.status(404).json({
        message: "Digital signature not found",
      });
    }

    // Check evidence file exists
    const evidenceFilePath = path.resolve(evidence.filePath);

    if (!fs.existsSync(evidenceFilePath)) {
      return res.status(404).json({
        message: "Evidence file not found",
      });
    }

    // Recalculate current evidence hash
    const fileBuffer = fs.readFileSync(evidenceFilePath);

    const currentHash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    // Check whether evidence was modified
    if (currentHash !== signature.evidenceHash) {
      signature.verificationStatus = "INVALID";
      await signature.save();

      return res.status(200).json({
        evidenceId,
        verificationStatus: "INVALID",
        verified: false,
        message: "Evidence has been modified after signing",
      });
    }

    // Read public key
    const publicKeyPath = path.join(
      __dirname,
      "../../keys/public.pem"
    );

    if (!fs.existsSync(publicKeyPath)) {
      return res.status(500).json({
        message: "Public key not found",
      });
    }

    const publicKey = fs.readFileSync(
      publicKeyPath,
      "utf8"
    );

    // Recreate the exact data that was signed
    const dataToVerify =
      `${evidence.evidenceId}:${signature.evidenceHash}`;

    // Verify cryptographic signature
    const verifier = crypto.createVerify("SHA256");

    verifier.update(dataToVerify);
    verifier.end();

    const isValid = verifier.verify(
      publicKey,
      signature.digitalSignature,
      "base64"
    );

    signature.verificationStatus = isValid
      ? "VALID"
      : "INVALID";

    await signature.save();

    res.status(200).json({
      evidenceId,
      verificationStatus: signature.verificationStatus,
      verified: isValid,
    });
  } catch (error) {
    res.status(500).json({
      message: "Signature verification failed",
      error: error.message,
    });
  }
};

module.exports = {
  signEvidence,
  verifySignature,
};