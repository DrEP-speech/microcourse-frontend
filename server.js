const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./src/config/db");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "microcourse-backend", time: new Date().toISOString() });
});

const authRoutes = require("./src/routes/authRoutes");
app.use("/api/auth", authRoutes);
console.log("✅ Mounted /api/auth");

try {
  const apiRoutes = require("./src/routes/apiRoutes");
  app.use("/api", apiRoutes);
  console.log("✅ Mounted /api");
} catch (e) {
  console.warn("⚠️ apiRoutes not mounted:", e.message);
}

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Startup error:", err.message);
    process.exit(1);
  });
