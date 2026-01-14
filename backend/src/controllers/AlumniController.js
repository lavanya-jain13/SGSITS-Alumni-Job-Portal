// src/controllers/AlumniController.js
const knex = require("../config/db");
const db = require("../config/db");
const { sendEmail } = require("../services/emailService");

const splitOfficeLocations = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);
};

// Get alumni profile with status
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    const user = await db("users")
      .where({ id: userId })
      .select("id", "email", "role", "status", "is_verified")
      .first();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const alumniProfile = await db("alumni_profiles")
      .where({ user_id: userId })
      .select("id", "name", "grad_year", "current_title", "status")
      .first();

    // Status priority: users.status (set by admin approval)
    const alumniStatus = user.status || "pending";

    return res.json({
      user: {
        ...user,
        alumniStatus,
      },
      profile: alumniProfile || null,
    });
  } catch (error) {
    console.error("Get Alumni Profile Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Alumni completes profile + company info
const completeProfile = async (req, res) => {
  let trx;
  try {
    trx = await db.transaction();
    const { id } = req.user;
    const {
      name,
      website,
      industry,
      company_size,
      about,
      linkedin,
      twitter,
      office_location,
      company_culture,
      currentTitle,
      gradYear,
    } = req.body;

    // 1️⃣ Update alumni profile
    await trx("alumni_profiles").where({ user_id: id }).update({
      grad_year: gradYear,
      current_title: currentTitle,
      created_at: trx.fn.now(),
    });

    // 2️⃣ Update (or assume existing) company for this user
    await trx("companies").where({ user_id: id }).update({
      name: name,
      website: website,
      industry: industry,
      company_size: company_size,
      about: about,
      linkedin: linkedin || null,
      twitter: twitter || null,
      office_location: office_location || null,
      company_culture: company_culture || null,
      document_url: linkedin, // legacy field kept for backwards compatibility
      created_at: trx.fn.now(),
    });

    // 3️⃣ Notify admin
    const user = await trx("users").where({ id }).select("email").first();
    if (user?.email) {
      await sendEmail(
        user.email,
        "New Alumni Approval Required",
        `Alumni with user ID ${id} has submitted company info for approval.`
      );
    }

    await trx.commit();
    res.json({ message: "Alumni profile submitted. Awaiting admin approval." });
  } catch (error) {
    if (trx) await trx.rollback();
    console.error("Alumni Profile Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    await knex("alumni_profiles").where({ user_id: id }).update(req.body);
    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ⭐ NEW: addCompany – allow alumni to add multiple companies
const addCompany = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user." });
    }

    const alumniProfile = await db("alumni_profiles")
      .select("id")
      .where({ user_id: userId })
      .first();

    if (!alumniProfile) {
      return res.status(400).json({
        error: "Alumni profile not found. Complete your profile first.",
      });
    }

    const {
      name,
      website,
      industry,
      company_size,
      about,
      linkedin,
      linkedin_url,
      twitter,
      twitter_url,
      office_location,
      office_locations,
      company_culture,
      status,
    } = req.body || {};

    if (!name) {
      return res.status(400).json({ error: "Company name is required." });
    }

    const resolvedOfficeLocation = Array.isArray(office_locations)
      ? office_locations.filter(Boolean).join(" | ")
      : office_location || null;

    const resolvedLinkedin = linkedin || linkedin_url || null;
    const resolvedTwitter = twitter || twitter_url || null;

    const insertData = {
      alumni_id: alumniProfile.id,
      user_id: userId,
      name,
      website: website || null,
      industry: industry || null,
      company_size: company_size || null,
      about: about || null,
      linkedin: resolvedLinkedin,
      twitter: resolvedTwitter,
      office_location: resolvedOfficeLocation,
      company_culture: company_culture || null,
      document_url: resolvedLinkedin || null, // legacy
      status: status || "pending",
      created_at: db.fn.now(),
    };

    const [company] = await db("companies")
      .insert(insertData)
      .returning([
        "id",
        "alumni_id",
        "user_id",
        "name",
        "website",
        "industry",
        "company_size",
        "about",
        "document_url",
        "linkedin",
        "twitter",
        "office_location",
        "company_culture",
        "status",
        "created_at",
      ]);

    return res.status(201).json({
      message: "Company added successfully",
      company,
    });
  } catch (error) {
    console.error("Add Company Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get companies for the authenticated alumni
const getMyCompanies = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({ error: "Only alumni can view companies." });
    }

    let companies;
    try {
      companies = await db("companies")
        .where({ user_id: userId })
        .select(
          "id",
          "name",
          "industry",
          "company_size",
          "website",
          "about",
          "document_url",
          "linkedin",
          "twitter",
          "office_location",
          "company_culture",
          "status",
          "created_at"
        )
        .orderBy("created_at", "desc");
    } catch (err) {
      // Fallback for databases where new columns are not migrated yet
      console.error("Get My Companies column mismatch, falling back:", err.message);
      companies = await db("companies")
        .where({ user_id: userId })
        .select(
          "id",
          "name",
          "industry",
          "company_size",
          "website",
          "about",
          "document_url",
          // legacy columns
          "linkedin_url",
          "twitter_url",
          "office_locations",
          "company_culture",
          "status",
          "created_at",
          db.raw("NULL as linkedin"),
          db.raw("NULL as twitter"),
          db.raw("NULL as office_location")
        )
        .orderBy("created_at", "desc");
    }

    const normalized = companies.map((c) => ({
      ...c,
      office_locations: splitOfficeLocations(c.office_locations || c.office_location),
      company_culture: c.company_culture || null,
      linkedin_url: c.linkedin_url || c.linkedin || c.document_url || null,
      twitter_url: c.twitter_url || c.twitter || null,
    }));

    return res.json({ companies: normalized });
  } catch (error) {
    console.error("Get My Companies Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get single company (owned by current alumni)
const getCompanyById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({ error: "Only alumni can view companies." });
    }

    let company;
    try {
      company = await db("companies")
        .where({ id, user_id: userId })
        .select(
          "id",
          "name",
          "industry",
          "company_size",
          "website",
          "about",
          "document_url",
          "linkedin",
          "twitter",
          "office_location",
          "company_culture",
          "status",
          "created_at"
        )
        .first();
    } catch (err) {
      console.error("Get Company column mismatch, falling back:", err.message);
      company = await db("companies")
        .where({ id, user_id: userId })
        .select(
          "id",
          "name",
          "industry",
          "company_size",
          "website",
          "about",
          "document_url",
          "status",
          "created_at",
          "linkedin_url",
          "twitter_url",
          "office_locations",
          db.raw("NULL as linkedin"),
          db.raw("NULL as twitter"),
          db.raw("NULL as office_location"),
          db.raw("NULL as company_culture")
        )
        .first();
    }

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Quick stats: active jobs and accepted hires for this company
    const [{ count: activeJobsRaw } = { count: 0 }] = await db("jobs")
      .where({ company_id: id })
      .andWhereRaw("LOWER(status) = 'active'")
      .count("* as count");

    const [{ count: alumniHiredRaw } = { count: 0 }] = await db("job_applications as ja")
      .join("jobs as j", "ja.job_id", "j.id")
      .where("j.company_id", id)
      .andWhereRaw("LOWER(ja.status) = 'accepted'")
      .count("* as count");

    const normalized = {
      ...company,
      office_locations: splitOfficeLocations(company.office_locations || company.office_location),
      company_culture: company.company_culture || null,
      linkedin_url:
        company.linkedin_url || company.linkedin || company.document_url || null,
      twitter_url: company.twitter_url || company.twitter || null,
      activeJobs: Number(activeJobsRaw || 0),
      alumniHired: Number(alumniHiredRaw || 0),
    };

    return res.json({ company: normalized });
  } catch (error) {
    console.error("Get Company Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update company (owned by current alumni)
const updateCompany = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({ error: "Only alumni can update companies." });
    }

    const company = await db("companies").where({ id, user_id: userId }).first();
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    const {
      name,
      industry,
      company_size,
      website,
      about,
      document_url,
      office_location,
      office_locations,
      company_culture,
      linkedin,
      linkedin_url,
      twitter,
      twitter_url,
    } = req.body || {};

    const resolvedLinkedin =
      typeof linkedin !== "undefined"
        ? linkedin
        : typeof linkedin_url !== "undefined"
        ? linkedin_url
        : company.linkedin || company.linkedin_url || company.document_url;

    const resolvedTwitter =
      typeof twitter !== "undefined"
        ? twitter
        : typeof twitter_url !== "undefined"
        ? twitter_url
        : company.twitter || company.twitter_url;

    const resolvedOfficeLocation = Array.isArray(office_locations)
        ? office_locations.filter(Boolean).join(" | ")
        : typeof office_location === "undefined"
        ? company.office_location
        : office_location;

    const fullUpdate = {
      name: name ?? company.name,
      industry: industry ?? company.industry,
      company_size: company_size ?? company.company_size,
      website: website ?? company.website,
      about: about ?? company.about,
      document_url: document_url ?? company.document_url,
      office_location: resolvedOfficeLocation,
      company_culture:
        typeof company_culture === "undefined"
          ? company.company_culture
          : company_culture,
      linkedin: resolvedLinkedin,
      twitter: resolvedTwitter,
    };

    const basicUpdate = {
      name: name ?? company.name,
      industry: industry ?? company.industry,
      company_size: company_size ?? company.company_size,
      website: website ?? company.website,
      about: about ?? company.about,
      document_url: document_url ?? company.document_url,
      office_location: resolvedOfficeLocation,
      company_culture:
        typeof company_culture === "undefined"
          ? company.company_culture
          : company_culture,
      linkedin: resolvedLinkedin,
      twitter: resolvedTwitter,
    };

    try {
      await db("companies").where({ id }).update(fullUpdate);
    } catch (err) {
      // Fallback if new columns are missing in the database
      console.error("Full update failed, falling back to basic update:", err.message);
      await db("companies").where({ id }).update(basicUpdate);
    }

    let updated;
    try {
      updated = await db("companies")
        .where({ id })
        .select(
          "id",
          "name",
          "industry",
          "company_size",
          "website",
          "about",
          "document_url",
          "linkedin",
          "twitter",
          "office_location",
          "company_culture",
          "status",
          "created_at"
        )
        .first();
    } catch (err) {
      console.error("Select updated company fallback:", err.message);
      updated = await db("companies")
        .where({ id })
        .select(
          "id",
          "name",
          "industry",
          "company_size",
          "website",
          "about",
          "document_url",
          "status",
          "created_at",
          "linkedin_url",
          "twitter_url",
          "office_locations",
          db.raw("NULL as linkedin"),
          db.raw("NULL as twitter"),
          db.raw("NULL as office_location"),
          db.raw("NULL as company_culture")
        )
        .first();
    }

    const normalized = updated
      ? {
          ...updated,
          office_locations: splitOfficeLocations(
            updated.office_locations || updated.office_location
          ),
          company_culture: updated.company_culture || null,
          linkedin_url:
            updated.linkedin_url || updated.linkedin || updated.document_url || null,
          twitter_url: updated.twitter_url || updated.twitter || null,
        }
      : updated;

    return res.json({
      message: "Company updated successfully",
      company: normalized,
    });
  } catch (error) {
    console.error("Update Company Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

module.exports = {
  getMyProfile,
  completeProfile,
  updateProfile,
  addCompany,
  getMyCompanies,
  getCompanyById,
  updateCompany,
};
