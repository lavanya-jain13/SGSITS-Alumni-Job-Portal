const express = require("express");
const {
  approveAlumni,
  rejectAlumni,
  getPendingAlumni,
  verifyAlumni,
  getAllJobsAdmin,
  deleteJobAdmin,
  getAllUsers,
  deleteUser,
  sendNotification,
  promoteUserToAdmin,
  getAdminStats,
} = require("../controllers/AdminController");
const { authenticate, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Dashboard stats
router.get("/stats", authenticate, isAdmin, getAdminStats);

// Alumni Verification
router.get("/alumni/pending", authenticate, isAdmin, getPendingAlumni);
router.put("/alumni/verify/:id", authenticate, isAdmin, verifyAlumni);

// Company Approval
router.patch(
  "/companies/:companyId/approve",
  authenticate,
  isAdmin,
  approveAlumni
);
router.patch(
  "/companies/:companyId/reject",
  authenticate,
  isAdmin,
  rejectAlumni
);

// Job Oversight
router.get("/jobs", authenticate, isAdmin, getAllJobsAdmin);
router.delete("/jobs/:id", authenticate, isAdmin, deleteJobAdmin);

// User Management
router.get("/users", authenticate, isAdmin, getAllUsers);
router.delete("/users/:id", authenticate, isAdmin, deleteUser);
router.patch("/users/:id/promote", authenticate, isAdmin, promoteUserToAdmin);

// Notifications
router.post("/notify", authenticate, isAdmin, sendNotification);

module.exports = router;
