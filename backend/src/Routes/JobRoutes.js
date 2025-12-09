// src/Routes/JobRoutes.js
const express = require("express");
const router = express.Router();

const jobController = require("../controllers/JobController");
const {
  authenticate,
  isAlumni,
  isStudent,
} = require("../middleware/authMiddleware");

// ================== ALUMNI JOB ROUTES ==================

// 1. Post a new job
router.post("/my-jobs/post-job", authenticate, isAlumni, jobController.postJob);

// 2. Get jobs posted by logged-in alumni
router.get("/my-jobs", authenticate, isAlumni, jobController.getMyJobs);

// 3. Get single job (only if posted by this alumni)
router.get(
  "/my-jobs/:jobId",
  authenticate,
  isAlumni,
  jobController.getMyJobById
);

// 4. Update job (full + partial)
router.put("/my-jobs/:jobId", authenticate, isAlumni, jobController.updateJob);

// 5. Delete job
router.delete(
  "/my-jobs/:jobId",
  authenticate,
  isAlumni,
  jobController.deleteJob
);

// 6. Repost / duplicate job
router.post(
  "/my-jobs/:jobId/repost",
  authenticate,
  isAlumni,
  jobController.repostJob
);

// ================== STUDENT JOB ROUTES ==================

// 7. Get all active jobs (for students)
router.get("/", authenticate, isStudent, jobController.getAllActiveJobs);

// 8. Get single job details (for students)
router.get("/:jobId", authenticate, isStudent, jobController.getJobDetails);

module.exports = router;
