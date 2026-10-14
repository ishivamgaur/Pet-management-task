const jwt = require("jsonwebtoken");
const User = require("../models/User");

// checks JWT, attaches user to req
async function needLogin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Please login first" });

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(data.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Session expired, login again" });
  }
}

function needAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
}

module.exports = { needLogin, needAdmin };
