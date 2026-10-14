const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const makeToken = require("../utils/makeToken");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists)
    return res.status(400).json({ message: "Email already registered" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashed,
  });

  const token = makeToken(user);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user)
    return res.status(400).json({ message: "Invalid email or password" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok)
    return res.status(400).json({ message: "Invalid email or password" });

  const token = makeToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// GET /api/auth/me
const { needLogin } = require("../middleware/auth");
router.get("/me", needLogin, (req, res) => {
  const u = req.user;
  res.json({ id: u._id, name: u.name, email: u.email, role: u.role });
});

module.exports = router;
