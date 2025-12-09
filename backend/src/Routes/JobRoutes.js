// src/Routes/JobRoutes.js
const express = require("express");
const router = express.Router();

const jobController = require("../controllers/JobController");
const {
  authenticate,
  isAdmin,
  isAlumni,
  isStudent,
} = require("../middleware/authMiddleware");
const resumeUpload = require("../middleware/resumeUpload");

// ================== ALUMNI JOB ROUTES ==================

// 1. Post a new job
router.post("/post-job", authenticate, isAlumni, jobController.postJob);

// 2. Get jobs posted by logged-in alumni
router.get("/my-jobs", authenticate, isAlumni, isAdmin, isStudent, jobController.getMyJobs);

// 3. Get single job (only if posted by this alumni)
router.get("/job/:id", authenticate, isAlumni, isAdmin, isStudent, jobController.getJobById);

// 4. Update job (only owner alumni)
router.put("/job/:id", authenticate, isAlumni, jobController.updateJob);

// 5. Delete job (only owner alumni)
router.delete("/job/:id", authenticate, isAlumni, jobController.deleteJob);

// 6. Repost / change max_applicants_allowed / reactivate
router.post("/job/:id/repost", authenticate, isAlumni, jobController.repostJob);

// 7. Total applications count for a job
router.get(
  "/job/:jobId/applications/count",
  authenticate,
  isAlumni,
  jobController.getJobApplicationsCount
);

// 8. Unread applications count for a job
router.get(
  "/job/:jobId/applications/unread-count",
  authenticate,
  isAlumni,
  jobController.getJobUnreadApplicationsCount
);

// 9. Detailed applicants list for a job
router.get(
  "/job/:jobId/applicants",
  authenticate,
  isAlumni,
  jobController.viewJobApplicants
);

// 10. Mark a job application as read
router.patch(
  "/applications/:applicationId/mark-read",
  authenticate,
  isAlumni,
  jobController.markJobApplicationRead
);

// 11. Accept job application
router.patch(
  "/applications/:applicationId/accept",
  authenticate,
  isAlumni,
  jobController.acceptJobApplication
);

// 12. Reject job application
router.patch(
  "/applications/:applicationId/reject",
  authenticate,
  isAlumni,
  jobController.rejectJobApplication
);

// 13. Put job application on hold
router.patch(
  "/applications/:applicationId/hold",
  authenticate,
  isAlumni,
  jobController.holdJobApplication
);

// ================== STUDENT JOB ROUTES ==================

// 14. Get all active jobs (student view)
router.get("/get-all-jobs-student", jobController.getAllJobsStudent);

// 15. Get job details for student
router.get("/get-job-by-id-student/:id", jobController.getJobByIdStudent);

// 16. Apply to a job (with resume upload)
router.post(
  "/apply-job",
  authenticate,
  isStudent,
  resumeUpload.single("resume"), // field name = "resume"
  jobController.applyJob
);

// 17. Withdraw job application
router.delete(
  "/withdraw-application/:applicationId",
  authenticate,
  isStudent,
  jobController.withdrawJobApplication
);

// 18. Get all jobs applied by logged-in student
router.get(
  "/get-applied-jobs",
  authenticate,
  isStudent,
  jobController.getAppliedJobs
);

// 19. Check if student has applied to this job + status
router.get(
  "/job/:jobId/application-status",
  authenticate,
  isStudent,
  jobController.checkJobApplicationStatus
);

module.exports = router;
