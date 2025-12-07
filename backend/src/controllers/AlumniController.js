// src/controllers/AlumniController.js
const knex = require("../config/db");
const db = require("../config/db");
const { sendEmail } = require("../services/emailService");

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
      document_url: linkedin,
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
    console.log("addCompany req.user =", req.user, "resolved userId =", userId);

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
      status,
    } = req.body || {};

    if (!name) {
      return res.status(400).json({ error: "Company name is required." });
    }

    const insertData = {
      alumni_id: alumniProfile.id,
      user_id: userId,
      name,
      website: website || null,
      industry: industry || null,
      company_size: company_size || null,
      about: about || null,
      document_url: linkedin || null,
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

module.exports = { completeProfile, updateProfile, addCompany };
