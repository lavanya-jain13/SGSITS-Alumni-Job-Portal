const express = require("express");
const {
  getCompanyByIdPublic,
} = require("../controllers/PublicCompanyController");

const router = express.Router();

// Public, read-only company page
router.get("/companies/:id", getCompanyByIdPublic);

module.exports = router;
