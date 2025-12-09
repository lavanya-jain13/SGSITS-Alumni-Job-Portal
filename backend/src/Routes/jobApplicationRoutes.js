// src/Routes/jobApplicationRoutes.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/JobApplicationController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

// Student withdraw their job application
router.delete('/jobs/apply/:applicationId',
  authenticate,
  authenticate.isStudent,
  authorizeRole(['student']),
  applicationController.withdrawApplication
);

// Alumni view applicants of their job
router.get('/jobs/:jobId/applicants',
  authenticate,
  authenticate.isAlumni,
  authorizeRole(['alumni', 'admin']),
  applicationController.viewApplicants
);

module.exports=router; 