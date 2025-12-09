// src/Routes/ProjectRoutes.js
const express = require("express");
const router = express.Router();

const projectController = require("../controllers/ProjectController");
// const projectApplicationController = require("../controllers/ProjectApplicationController");
const {
  authenticate,
  isAdmin,
  isAlumni,
  isStudent,
} = require("../middleware/authMiddleware");
const resumeUpload = require("../middleware/resumeUpload");

// ================== ALUMNI – PROJECT POSTS ==================

// 1. Create a new project post
router.post(
  "/post-project",
  authenticate,
  isAlumni,
  projectController.postProject
);

// 2. Get all project posts created by logged-in alumni
router.get(
  "/my-projects",
  authenticate,
  isAlumni,
  projectController.getMyProjects
);

// 3. Get single project post (only if owned by this alumni)
router.get(
  "/project/:id",
  authenticate,
  isAlumni,
  projectController.getProjectById
);

// 4. Update a project post
router.put(
  "/project/:id",
  authenticate,
  isAlumni,
  projectController.updateProject
);

// 5. Delete a project post
router.delete(
  "/project/:id",
  authenticate,
  isAlumni,
  projectController.deleteProject
);

// 6. Repost / reactivate / change max_applicants_allowed
router.post(
  "/project/:id/repost",
  authenticate,
  isAlumni,
  projectController.repostProject
);

// 7. Total applications count for a project
// router.get(
//   "/project/:projectId/applications/count",
//   authenticate,
//   isAlumni,
//   projectApplicationController.getProjectApplicationsCount
// );

// // 8. Unread applications count for a project
// router.get(
//   "/project/:projectId/applications/unread-count",
//   authenticate,
//   isAlumni,
//   projectApplicationController.getProjectUnreadApplicationsCount
// );

// // 9. Detailed list of applicants for a project
// router.get(
//   "/project/:projectId/applicants",
//   authenticate,
//   isAlumni,
//   projectApplicationController.viewProjectApplicants
// );

// // 10. Mark a single project application as read
// router.patch(
//   "/applications/:applicationId/mark-read",
//   authenticate,
//   isAlumni,
//   projectApplicationController.markProjectApplicationRead
// );

// // 11. Accept a particular project application
// router.patch(
//   "/applications/:applicationId/accept",
//   authenticate,
//   isAlumni,
//   projectApplicationController.acceptProjectApplication
// );

// // 12. Reject a particular project application
// router.patch(
//   "/applications/:applicationId/reject",
//   authenticate,
//   isAlumni,
//   projectApplicationController.rejectProjectApplication
// );

// // 13. Put a particular project application on hold
// router.patch(
//   "/applications/:applicationId/hold",
//   authenticate,
//   isAlumni,
//   projectApplicationController.holdProjectApplication
// );

// // ================== STUDENT – PROJECT POSTS ==================

// // 14. Get all active project posts (student feed)
// router.get(
//   "/get-all-projects-student",
//   projectController.getAllProjectsStudent
// );

// // 15. Get details of a single project post for student
// router.get(
//   "/get-project-by-id-student/:id",
//   projectController.getProjectByIdStudent
// );

// // 16. Apply to a project (with resume upload)
// router.post(
//   "/apply-project",
//   authenticate,
//   isStudent,
//   resumeUpload.single("resume"), // field name should be "resume"
//   projectApplicationController.applyProject
// );

// // 17. Withdraw an application for a project
// router.delete(
//   "/withdraw-project-application/:applicationId",
//   authenticate,
//   isStudent,
//   projectApplicationController.withdrawProjectApplication
// );

// // 18. Get all projects the student has applied to
// router.get(
//   "/get-applied-projects",
//   authenticate,
//   isStudent,
//   projectApplicationController.getAppliedProjects
// );

// // 19. Check whether student has applied to a given project + status
// router.get(
//   "/project/:projectId/application-status",
//   authenticate,
//   isStudent,
//   projectApplicationController.checkProjectApplicationStatus
// );

module.exports = router;
