// src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    // 👇 use the same secret string you used in the controller
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }
  next();
};

const isAlumni = (req, res, next) => {
  if (req.user.role !== "alumni") {
    return res.status(403).json({ error: "Forbidden: Alumni only" });
  }
  next();
};

const isStudent = (req, res, next) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Forbidden: Student only" });
  }
  next();
};

module.exports = { authenticate, isAdmin, isAlumni, isStudent };
