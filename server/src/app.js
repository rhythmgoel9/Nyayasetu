const dns = require("dns");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dns.setServers(["1.1.1.1"]);

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const firRoutes = require("./routes/firRoutes");
const caseRoutes = require("./routes/caseRoutes");
const evidenceRoutes = require("./routes/evidenceRoutes");
const custodyRoutes = require("./routes/custodyRoutes");
const signatureRoutes = require("./routes/signatureRoutes");
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/fir", firRoutes);
app.use("/api/case", caseRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/evidence", custodyRoutes);
app.use("/api/evidence", signatureRoutes);
app.get("/", (req, res) => {
  res.send("Anveshak Backend is running");
});

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});