// src/routes/alumniRoutes.js
const express = require("express");
const {
  getMyProfile,
  completeProfile,
  updateProfile,
  addCompany,
  getMyCompanies,
  getCompanyById,
  updateCompany,
} = require("../controllers/AlumniController");
const { authenticate, isAdmin, isAlumni } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", authenticate, isAlumni, getMyProfile);
router.post("/profile", authenticate,isAlumni, completeProfile);
router.post("/update-profile", authenticate, updateProfile);

router.post("/add-company", authenticate, isAlumni, addCompany);
router.get("/companies", authenticate, isAlumni, getMyCompanies);
router.get("/companies/:id", authenticate, isAlumni, getCompanyById);
router.put("/companies/:id", authenticate, isAlumni, updateCompany);

module.exports = router;

