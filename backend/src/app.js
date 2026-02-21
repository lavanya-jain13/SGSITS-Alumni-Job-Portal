const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const authRoutes = require("./Routes/authRoutes");
const studentRoutes = require("./Routes/studentRoutes");
const alumniRoutes = require("./Routes/alumniRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const authUtilityRoutes = require("./Routes/authUtilityRoutes");
const JobRoutes = require("./Routes/JobRoutes");
const utilityRoutes = require("./Routes/utilityRoutes");
const ProjectRoutes = require("./Routes/projectRoutes");
const OtherRoutes = require("./Routes/otherRoutes");
const publicCompanyRoutes = require("./Routes/publicCompanyRoutes");

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
});

const envOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const fallbackWhitelist = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
  "https://sgsits-alumni-jobs.com",
  "https://www.sgsits-alumni-jobs.com",
  "http://44.254.252.160",
];

const whitelist = envOrigins.length > 0 ? envOrigins : fallbackWhitelist;

// ==================== MIDDLEWARE ====================
app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser tools (postman/curl) where origin is undefined
      if (!origin) return cb(null, true);

      // ✅ IMPORTANT: return the exact origin (NOT "*")
      if (whitelist.includes(origin)) return cb(null, origin);

      return cb(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.json());


// ✅ Preflight handler (use RegExp to avoid path-to-regexp "*" issues)
app.options(/.*/, cors());

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==================== ROUTES ====================
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/authUtil", authUtilityRoutes);
app.use("/api/job", JobRoutes);
app.use("/api/project", ProjectRoutes);
app.use("/api/other", OtherRoutes);
app.use("/api", utilityRoutes);
app.use("/api/public", publicCompanyRoutes);

// ==================== HEALTH CHECK ====================
app.get("/", (req, res) => {
  res.send("SGSITS Alumni Job Portal Backend is running...");
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
