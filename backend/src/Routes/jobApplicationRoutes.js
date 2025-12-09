// src/Routes/JobApplicationRoutes.js
const express = require("express");
const router = express.Router();

const jobApplicationController = require("../controllers/JobApplicationController");
const {
  authenticate,
  isAlumni,
  isStudent,
} = require("../middleware/authMiddleware");

// ================== STUDENT SIDE: APPLY / MY APPLICATIONS ==================

// 1. Apply to a job
router.post(
  "/jobs/:jobId/apply",
  authenticate,
  isStudent,
  jobApplicationController.applyToJob
);

// 2. Get all my job applications
router.get(
  "/my-applications",
  authenticate,
  isStudent,
  jobApplicationController.getMyJobApplications
);

// 3. Get a single my job application
router.get(
  "/my-applications/:applicationId",
  authenticate,
  isStudent,
  jobApplicationController.getMySingleJobApplication
);

// 4. Withdraw my application (only if pending)
router.delete(
  "/my-applications/:applicationId",
  authenticate,
  isStudent,
  jobApplicationController.withdrawJobApplication
);

// ================== ALUMNI SIDE: MANAGE APPLICATIONS ON THEIR JOBS ==================

// 5. Get all applications for a specific job
router.get(
  "/my-jobs/:jobId/applications",
  authenticate,
  isAlumni,
  jobApplicationController.getApplicationsForJob
);

// 6. Get single application details (for alumni)
router.get(
  "/my-jobs/:jobId/applications/:applicationId",
  authenticate,
  isAlumni,
  jobApplicationController.getApplicationById
);

// 7. Update application status
router.patch(
  "/applications/:applicationId/status",
  authenticate,
  isAlumni,
  jobApplicationController.updateApplicationStatus
);

// 8. Mark application as read
router.patch(
  "/applications/:applicationId/read",
  authenticate,
  isAlumni,
  jobApplicationController.markApplicationAsRead
);

// 9. Bulk update status for applications of a job
router.patch(
  "/my-jobs/:jobId/applications/bulk-status",
  authenticate,
  isAlumni,
  jobApplicationController.bulkUpdateApplicationStatus
);

// 10. Dashboard summary for alumni jobs & applications
router.get(
  "/my-dashboard/summary",
  authenticate,
  isAlumni,
  jobApplicationController.getAlumniJobsDashboardSummary
);

module.exports = router;
