// src/Routes/OtherRoutes.js
const express = require("express");
const router = express.Router();

const otherController = require("../controllers/OtherController");
// const otherApplicationController = require("../controllers/OtherApplicationController");
const {
  authenticate,
  isAdmin,
  isAlumni,
  isStudent,
} = require("../middleware/authMiddleware");
const resumeUpload = require("../middleware/resumeUpload");

// ================== ALUMNI – OTHER POSTS ==================

// 1. Create a new "other" post
router.post(
  "/post-other",
  authenticate,
  isAlumni,
  otherController.postOtherPost
);

// 2. Get all "other" posts created by logged-in alumni
router.get(
  "/my-other-posts",
  authenticate,
  isAlumni,
  otherController.getMyOtherPosts
);

// 3. Get single other post (only if owned by this alumni)
router.get(
  "/other/:id",
  authenticate,
  isAlumni,
  otherController.getOtherPostById
);

// 4. Update an other post
router.put(
  "/other/:id",
  authenticate,
  isAlumni,
  otherController.updateOtherPost
);

// 5. Delete an other post
router.delete(
  "/other/:id",
  authenticate,
  isAlumni,
  otherController.deleteOtherPost
);

// 6. Repost / reactivate / change max_applicants_allowed
router.post(
  "/other/:id/repost",
  authenticate,
  isAlumni,
  otherController.repostOtherPost
);

// 7. Total applications count for a particular other post
// router.get(
//   "/other/:otherPostId/applications/count",
//   authenticate,
//   isAlumni,
//   otherApplicationController.getOtherPostApplicationsCount
// );

// // 8. Unread applications count for a particular other post
// router.get(
//   "/other/:otherPostId/applications/unread-count",
//   authenticate,
//   isAlumni,
//   otherApplicationController.getOtherPostUnreadApplicationsCount
// );

// // 9. Detailed list of applicants for an other post
// router.get(
//   "/other/:otherPostId/applicants",
//   authenticate,
//   isAlumni,
//   otherApplicationController.viewOtherPostApplicants
// );

// // 10. Mark a single application as read
// router.patch(
//   "/applications/:applicationId/mark-read",
//   authenticate,
//   isAlumni,
//   otherApplicationController.markOtherPostApplicationRead
// );

// // 11. Accept a particular application
// router.patch(
//   "/applications/:applicationId/accept",
//   authenticate,
//   isAlumni,
//   otherApplicationController.acceptOtherPostApplication
// );

// // 12. Reject a particular application
// router.patch(
//   "/applications/:applicationId/reject",
//   authenticate,
//   isAlumni,
//   otherApplicationController.rejectOtherPostApplication
// );

// // 13. Put a particular application on hold
// router.patch(
//   "/applications/:applicationId/hold",
//   authenticate,
//   isAlumni,
//   otherApplicationController.holdOtherPostApplication
// );

// // ================== STUDENT – OTHER POSTS ==================

// // 14. Get all active other posts (student feed)
// router.get(
//   "/get-all-other-student",
//   otherController.getAllOtherPostsStudent
// );

// // 15. Get details of a single other post for student
// router.get(
//   "/get-other-by-id-student/:id",
//   otherController.getOtherPostByIdStudent
// );

// // 16. Apply to an other post (with resume upload)
// router.post(
//   "/apply-other",
//   authenticate,
//   isStudent,
//   resumeUpload.single("resume"), // field name should be "resume"
//   otherApplicationController.applyOtherPost
// );

// // 17. Withdraw an application for an other post
// router.delete(
//   "/withdraw-other-application/:applicationId",
//   authenticate,
//   isStudent,
//   otherApplicationController.withdrawOtherPostApplication
// );

// // 18. Get all "other" posts the student has applied to
// router.get(
//   "/get-applied-other",
//   authenticate,
//   isStudent,
//   otherApplicationController.getAppliedOtherPosts
// );

// // 19. Check whether student has applied to a given other post + status
// router.get(
//   "/other/:otherPostId/application-status",
//   authenticate,
//   isStudent,
//   otherApplicationController.checkOtherPostApplicationStatus
// );

module.exports = router;
