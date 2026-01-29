// src/controllers/AlumniController.js
const knex = require("../config/db");
const db = require("../config/db");
const { sendEmail } = require("../services/emailService");

// ==========================
// HELPERS
// ==========================
const splitOfficeLocations = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);
};
const cleanValue = (v) => {
  if (typeof v === "string" && v.trim() === "") return null;
  return v;
};

// ==========================
// GET MY PROFILE
// ==========================
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

    return res.json({
      user: {
        ...user,
        alumniStatus: user.status || "pending",
      },
      profile: alumniProfile || null,
    });
  } catch (error) {
    console.error("Get Alumni Profile Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ==========================
// COMPLETE PROFILE (FIXED)
// ==========================
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
      founded_year,
      contact_person_name,
      contact_person_email,
      contact_person_phone,
      office_location,
      company_culture,
      currentTitle,
      gradYear,
    } = req.body;

    // 1️⃣ Update alumni profile
    await trx("alumni_profiles").where({ user_id: id }).update({
      grad_year: gradYear,
      current_title: currentTitle,
      updated_at: trx.fn.now(),
    });

    // 2️⃣ UPSERT company (MAIN BUG FIX)
    const existingCompany = await trx("companies")
      .where({ user_id: id })
      .first();

    const companyPayload = {
      user_id: id,
      name,
      website,
      industry,
      company_size,
      about,
      linkedin: linkedin || null,
      twitter: twitter || null,
      founded_year: founded_year || null,

      // ✅ CONTACT PERSON FIELDS
      contact_person_name: contact_person_name || null,
      contact_person_email: contact_person_email || null,
      contact_person_phone: contact_person_phone || null,

      office_location: office_location || null,
      company_culture: company_culture || null,
      document_url: linkedin || null,
    };

    if (existingCompany) {
      await trx("companies")
        .where({ user_id: id })
        .update({
          ...companyPayload,
          updated_at: trx.fn.now(),
        });
    } else {
      await trx("companies").insert({
        ...companyPayload,
        status: "pending",
        created_at: trx.fn.now(),
      });
    }

    // 3️⃣ Notify admin
    const user = await trx("users").where({ id }).select("email").first();
    if (user?.email) {
      await sendEmail(
        user.email,
        "New Alumni Approval Required",
        `Alumni with user ID ${id} has submitted company details.`,
      );
    }

    await trx.commit();
    return res.json({
      message: "Alumni profile submitted. Awaiting admin approval.",
    });
  } catch (error) {
    if (trx) await trx.rollback();
    console.error("Complete Profile Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ==========================
// UPDATE ALUMNI PROFILE
// ==========================
const updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    await knex("alumni_profiles").where({ user_id: id }).update(req.body);
    return res.json({ message: "Profile updated" });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

// ==========================
// ADD COMPANY
// ==========================
const addCompany = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user" });
    }

    const alumniProfile = await db("alumni_profiles")
      .where({ user_id: userId })
      .first();

    if (!alumniProfile) {
      return res
        .status(400)
        .json({ error: "Complete your alumni profile first." });
    }

    const {
      name,
      website,
      industry,
      company_size,
      about,
      linkedin,
      twitter,
      founded_year,
      contact_person_name,
      contact_person_email,
      contact_person_phone,
      office_locations,
      company_culture,
      status,
    } = req.body || {};

    if (!name) {
      return res.status(400).json({ error: "Company name is required." });
    }

    const office_location = Array.isArray(office_locations)
      ? office_locations.filter(Boolean).join(" | ")
      : null;

    const [company] = await db("companies")
      .insert({
        alumni_id: alumniProfile.id,
        user_id: userId,
        name,
        website: website || null,
        industry: industry || null,
        company_size: company_size || null,
        about: about || null,
        linkedin: linkedin || null,
        twitter: twitter || null,
        founded_year: founded_year || null,

        // ✅ CONTACT PERSON FIELDS
        contact_person_name: contact_person_name || null,
        contact_person_email: contact_person_email || null,
        contact_person_phone: contact_person_phone || null,

        office_location,
        company_culture: company_culture || null,
        document_url: linkedin || null,
        status: status || "pending",
        created_at: db.fn.now(),
      })
      .returning("*");

    return res.status(201).json({
      message: "Company added successfully",
      company,
    });
  } catch (error) {
    console.error("Add Company Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ==========================
// GET MY COMPANIES
// ==========================
const getMyCompanies = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({ error: "Only alumni can view companies." });
    }

    const companies = await db("companies")
      .where({ user_id: userId })
      .orderBy("created_at", "desc");

    const normalized = companies.map((c) => ({
      ...c,
      office_locations: splitOfficeLocations(c.office_location),
      linkedin_url: c.linkedin || c.document_url || null,
      twitter_url: c.twitter || null,
    }));

    return res.json({ companies: normalized });
  } catch (error) {
    console.error("Get My Companies Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ==========================
// GET COMPANY BY ID
// ==========================
const getCompanyById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({ error: "Only alumni can view companies." });
    }

    const company = await db("companies")
      .where({ id, user_id: userId })
      .first();

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    return res.json({
      company: {
        ...company,
        office_locations: splitOfficeLocations(company.office_location),
        linkedin_url: company.linkedin || company.document_url || null,
        twitter_url: company.twitter || null,
      },
    });
  } catch (error) {
    console.error("Get Company Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ==========================
// UPDATE COMPANY
// ==========================
const updateCompany = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res
        .status(403)
        .json({ error: "Only alumni can update companies." });
    }

    const company = await db("companies")
      .where({ id, user_id: userId })
      .first();

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    const b = req.body || {};

    const resolvedOfficeLocation = Array.isArray(b.office_locations)
      ? b.office_locations.filter(Boolean).join(" | ")
      : (cleanValue(b.office_location) ?? company.office_location);

    const resolvedLinkedin =
      cleanValue(b.linkedin) ??
      cleanValue(b.linkedin_url) ??
      company.linkedin ??
      company.document_url ??
      null;

    const resolvedTwitter =
      cleanValue(b.twitter) ??
      cleanValue(b.twitter_url) ??
      company.twitter ??
      null;

    const updatePayload = {
      name: cleanValue(b.name) ?? company.name,
      website: cleanValue(b.website) ?? company.website,
      industry: cleanValue(b.industry) ?? company.industry,
      company_size: cleanValue(b.company_size) ?? company.company_size,
      about: cleanValue(b.about) ?? company.about,
      founded_year: b.founded_year ?? company.founded_year,
      company_culture: cleanValue(b.company_culture) ?? company.company_culture,

      // 🔥 THIS IS THE FIX
      contact_person_name:
        cleanValue(b.contact_person_name) ?? company.contact_person_name,

      contact_person_email:
        cleanValue(b.contact_person_email) ?? company.contact_person_email,

      contact_person_phone:
        cleanValue(b.contact_person_phone) ?? company.contact_person_phone,

      linkedin: resolvedLinkedin,
      twitter: resolvedTwitter,
      office_location: resolvedOfficeLocation,
      document_url: resolvedLinkedin,
    };

    await db("companies").where({ id, user_id: userId }).update(updatePayload);
    console.log("Update Payload:", updatePayload);

    const updated = await db("companies").where({ id, user_id: userId }).first();

    return res.json({
      message: "Company updated successfully",
      company: {
        ...updated,
        office_locations: splitOfficeLocations(updated.office_location),
        linkedin_url: updated.linkedin || updated.document_url || null,
        twitter_url: updated.twitter || null,
      },
    });
  } catch (error) {
    console.error("Update Company Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ==========================
// EXPORTS
// ==========================
module.exports = {
  getMyProfile,
  completeProfile,
  updateProfile,
  addCompany,
  getMyCompanies,
  getCompanyById,
  updateCompany,
};
