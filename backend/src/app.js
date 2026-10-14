const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const petRoutes = require("./routes/pets");
const appRoutes = require("./routes/applications");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/applications", appRoutes);

// 404 + error fallback
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
// eslint-disable-next-line
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

module.exports = app;
