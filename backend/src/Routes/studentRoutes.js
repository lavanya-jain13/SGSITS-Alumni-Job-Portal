const express = require("express");
const { getMyProfile, upsertProfile } = require("../controllers/StudentController");
const { authenticate } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");
const Joi = require("joi");
const uploadResume = require("../middleware/resumeUpload");

const router = express.Router();

/**
 * PUT validation schema
 */
const experienceSchema = Joi.object({
  title: Joi.string().allow("").optional(),
  position: Joi.string().allow("").optional(),
  company: Joi.string().allow("").optional(),
  duration: Joi.string().allow("").optional(),
  description: Joi.string().allow("").optional(),
  link: Joi.string().allow("").optional(),
});

const putProfileSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    studentId: Joi.string().min(2).max(50).optional(),
    branch: Joi.string().min(2).max(100).optional(),
    gradYear: Joi.number().integer().min(1950).max(2100).optional(),
    skills: Joi.alternatives(Joi.string(), Joi.array().items(Joi.string())).optional(),
    resumeUrl: Joi.string().uri().allow("").optional(),
    phone: Joi.string().max(20).allow("").optional(),
    dateOfBirth: Joi.alternatives().try(Joi.date(), Joi.string().allow("")).optional(),
    currentYear: Joi.string().max(50).allow("").optional(),
    cgpa: Joi.number().min(0).max(10).optional(),
    achievements: Joi.string().allow("").optional(),
    summary: Joi.string().allow("").optional(),
    yearsOfExperience: Joi.number().integer().min(0).max(50).optional(),
    experiences: Joi.array().items(experienceSchema).optional(),

    // NEW EXTRA FIELDS
    address: Joi.string().allow("").optional(),
    desiredRoles: Joi.alternatives(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).optional(),
    preferredLocations: Joi.alternatives(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).optional(),
    workMode: Joi.string().max(50).allow("").optional(),
    dataConsent: Joi.boolean().optional(),
    contactPermissions: Joi.boolean().optional(),
    profileVisibility: Joi.boolean().optional(),
    codeOfConduct: Joi.boolean().optional(),
  }),
};

// GET student profile
router.get(
  "/profile",
  authenticate,
  roleMiddleware("student"),
  getMyProfile
);

// CREATE / UPDATE student profile + resume
router.put(
  "/profile",
  authenticate,
  roleMiddleware("student"),
  // only parse file upload when multipart/form-data is used
  (req, res, next) => {
    if (req.is("multipart/form-data")) {
      return uploadResume.single("resume")(req, res, next);
    }
    return next();
  },
  // normalize multipart string fields before validation
  (req, res, next) => {
    if (req.is("multipart/form-data")) {
      if (typeof req.body.experiences === "string") {
        try {
          req.body.experiences = JSON.parse(req.body.experiences);
        } catch (e) {
          // leave as-is; validation will catch
        }
      }
      if (typeof req.body.skills === "string") {
        try {
          const parsed = JSON.parse(req.body.skills);
          req.body.skills = parsed;
        } catch {
          // allow comma string to pass Joi
        }
      }
      ["gradYear", "cgpa", "yearsOfExperience"].forEach((numField) => {
        if (req.body[numField] !== undefined) {
          const n = Number(req.body[numField]);
          if (!Number.isNaN(n)) req.body[numField] = n;
        }
      });
    }
    next();
  },
  validate(putProfileSchema),
  upsertProfile
);

module.exports = router;
