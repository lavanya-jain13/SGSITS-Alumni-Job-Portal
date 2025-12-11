const db = require("../config/db");
const { sendEmail } = require("../services/emailService");

// Helper to safely send HTML/text emails
const notifyUser = async (email, subject, message) => {
  if (!email) return;
  try {
    await sendEmail({
      to: email,
      subject,
      html: `${message}`,
      text: message,
    });
  } catch (err) {
    console.error("Email send error:", err.message);
  }
};

/* -------------------------------------------
   1️⃣ ALUMNI VERIFICATION
-------------------------------------------- */
exports.getPendingAlumni = async (req, res) => {
  try {
    const rows = await db("users as u")
      .leftJoin("alumni_profiles as ap", "ap.user_id", "u.id")
      .leftJoin("companies as c", "c.alumni_id", "ap.id")
      .select(
        "u.id as user_id",
        "u.email",
        "u.status",
        "u.is_verified",
        "ap.id as alumni_profile_id",
        "ap.name",
        "ap.grad_year",
        "ap.created_at",
        "c.id as company_id",
        "c.name as company_name",
        "c.status as company_status"
      )
      .where({ "u.role": "alumni" })
      .andWhere((qb) => {
        qb.where({ "u.status": "pending" }).orWhereNull("u.status");
      })
      .orderBy("ap.created_at", "desc");

    res.json(rows);
  } catch (error) {
    console.error("getPendingAlumni error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.verifyAlumni = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status))
    return res.status(400).json({ error: "Invalid status" });

  try {
    const user = await db("users").where({ id, role: "alumni" }).first();
    if (!user) return res.status(404).json({ error: "Alumni not found" });

    await db("users")
      .where({ id })
      .update({
        status,
        is_verified: status === "approved",
      });

    await notifyUser(
      user.email,
      "Alumni Registration Status",
      `Your alumni registration has been ${status}.`
    );

    res.json({ message: `Alumni ${status}` });
  } catch (error) {
    console.error("verifyAlumni error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* -------------------------------------------
   2️⃣ COMPANY APPROVAL
-------------------------------------------- */
exports.approveAlumni = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await db("companies").where({ id: companyId }).first();
    if (!company)
      return res
        .status(404)
        .json({ error: "Company not found for this alumni" });

    await db("companies").where({ id: companyId }).update({ status: "approved" });

    const alumni = await db("alumni_profiles")
      .where({ id: company.alumni_id })
      .first();
    if (!alumni) return res.status(404).json({ error: "Alumni not found" });

    await db("users")
      .where({ id: alumni.user_id })
      .update({ status: "approved", is_verified: true });

    const user = await db("users").where({ id: alumni.user_id }).first();
    await notifyUser(
      user?.email,
      "Company Approved",
      "Your company has been approved. You can now post jobs."
    );

    res.json({ message: "Alumni & company approved successfully" });
  } catch (error) {
    console.error("approveAlumni error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.rejectAlumni = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await db("companies").where({ id: companyId }).first();
    if (!company)
      return res
        .status(404)
        .json({ error: "Company not found for this alumni" });

    await db("companies").where({ id: companyId }).update({ status: "rejected" });

    const alumni = await db("alumni_profiles")
      .where({ id: company.alumni_id })
      .first();
    if (!alumni) return res.status(404).json({ error: "Alumni not found" });

    await db("users")
      .where({ id: alumni.user_id })
      .update({ status: "rejected" });

    res.json({ message: "Alumni & company rejected successfully" });
  } catch (error) {
    console.error("rejectAlumni error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* -------------------------------------------
   3️⃣ JOB OVERSIGHT
-------------------------------------------- */

// Get all job applications (admin view)
exports.getAllApplicationsAdmin = async (req, res) => {
  try {
    const applications = await db("job_applications as ja")
      .join("jobs as j", "ja.job_id", "j.id")
      .join("users as u", "ja.user_id", "u.id")
      .leftJoin("student_profiles as sp", "sp.user_id", "u.id")
      .leftJoin("companies as c", "j.company_id", "c.id")
      .leftJoin("alumni_profiles as ap", "j.alumni_id", "ap.id")
      .select(
        "ja.id as application_id",
        "ja.status as application_status",
        "ja.is_read",
        "ja.resume_url",
        "ja.applied_at",
        "j.id as job_id",
        "j.job_title",
        "j.job_type",
        "j.location as job_location",
        "j.status as job_status",
        "u.id as user_id",
        "u.email as applicant_email",
        "sp.name as applicant_name",
        "sp.branch as applicant_branch",
        "sp.grad_year as applicant_grad_year",
        "c.name as company_name",
        "ap.name as alumni_name"
      )
      .orderBy("ja.applied_at", "desc");

    res.json({ applications });
  } catch (error) {
    console.error("getAllApplicationsAdmin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get applications for a specific job (admin view)
exports.getJobApplicationsAdmin = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await db("jobs").where({ id: jobId }).first();
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const applicants = await db("job_applications as ja")
      .join("users as u", "ja.user_id", "u.id")
      .leftJoin("student_profiles as sp", "sp.user_id", "u.id")
      .leftJoin("jobs as j", "ja.job_id", "j.id")
      .where("ja.job_id", jobId)
      .select(
        "ja.id as application_id",
        "ja.status as application_status",
        "ja.is_read",
        "ja.resume_url",
        "ja.applied_at",
        "u.id as user_id",
        "u.email as user_email",
        "sp.name as student_name",
        "sp.branch as student_branch",
        "sp.grad_year as student_grad_year",
        "sp.skills as student_skills",
        "sp.phone_number as student_phone",
        "sp.resume_url as profile_resume_url",
        "j.id as job_id",
        "j.skills_required as job_skills"
      )
      .orderBy("ja.applied_at", "desc");

    res.json({ job, applicants });
  } catch (error) {
    console.error("getJobApplicationsAdmin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllJobsAdmin = async (req, res) => {
  try {
    const rows = await db("jobs as j")
      .leftJoin("companies as c", "c.id", "j.company_id")
      .leftJoin("alumni_profiles as ap", "ap.id", "j.alumni_id")
      .leftJoin("users as u", "u.id", "ap.user_id")
      .leftJoin("job_applications as ja", "ja.job_id", "j.id")
      .select(
        "j.id as job_id",
        "j.company_id",
        "j.job_title",
        "j.job_description",
        "j.job_type",
        "j.location as job_location",
        "j.application_deadline",
        "j.allowed_branches",
        "j.salary_range",
        "j.created_at as job_created_at",
        "j.status as job_status",
        "c.name as company_name",
        "c.office_location as company_location",
        "c.industry as company_industry",
        "c.company_size",
        "c.status as company_status",
        "c.website",
        "ap.name as alumni_name",
        "u.email as alumni_email"
      )
      .countDistinct("ja.id as applications_count")
      .groupBy(
        "j.id",
        "c.id",
        "ap.id",
        "u.id"
      )
      .orderBy("j.created_at", "desc");

    res.json(rows);
  } catch (error) {
    console.error("getAllJobsAdmin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteJobAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const exists = await db("jobs").where({ id }).first();
    if (!exists) return res.status(404).json({ error: "Job not found" });

    await db("jobs").where({ id }).del();
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("deleteJobAdmin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* -------------------------------------------
   4️⃣ USER MANAGEMENT
-------------------------------------------- */
exports.getAllUsers = async (req, res) => {
  try {
    const students = await db("student_profiles as sp")
      .leftJoin("users as u", "u.id", "sp.user_id")
      .select(
        "u.id as user_id",
        "u.email",
        "u.role",
        "u.status",
        "sp.name",
        "sp.branch",
        "sp.grad_year"
      )
      .orderBy("sp.created_at", "desc");

    const alumni = await db("alumni_profiles as ap")
      .leftJoin("users as u", "u.id", "ap.user_id")
      .leftJoin("companies as c", "c.alumni_id", "ap.id")
      .select(
        "u.id as user_id",
        "u.email",
        "u.role",
        "u.status",
        "ap.name",
        "ap.grad_year",
        "c.id as company_id",
        "c.name as company_name",
        "c.status as company_status"
      )
      .orderBy("ap.created_at", "desc");

    res.json({ students, alumni });
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const exists = await db("users").where({ id }).first();
    if (!exists) return res.status(404).json({ error: "User not found" });

    await db("users").where({ id }).del();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Promote a user to admin; only existing admins can call this
exports.promoteUserToAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await db("users").where({ id }).first();
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role === "admin") {
      return res.status(400).json({ error: "User is already an admin" });
    }

    await db("users").where({ id }).update({ role: "admin" });
    return res.json({ message: "User promoted to admin successfully" });
  } catch (error) {
    console.error("promoteUserToAdmin error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* -------------------------------------------
   5️⃣ NOTIFICATIONS
-------------------------------------------- */
exports.sendNotification = async (req, res) => {
  const { message, targetRole } = req.body;

  if (!message || !["student", "alumni"].includes(targetRole))
    return res
      .status(400)
      .json({ error: "message and targetRole ('student'|'alumni') required" });

  try {
    const recipients = await db("users")
      .where({ role: targetRole })
      .select("email");

    for (const r of recipients) {
      await notifyUser(r.email, "Notification from Admin", message);
    }

    res.json({
      message: `Notifications sent to ${recipients.length} ${targetRole}(s)`,
    });
  } catch (error) {
    console.error("sendNotification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* -------------------------------------------
   6. ADMIN STATS (dashboard cards)
-------------------------------------------- */
exports.getAdminStats = async (_req, res) => {
  try {
    const [{ count: totalUsers }] = await db("users").count("* as count");
    const [{ count: studentsCount }] = await db("users")
      .where({ role: "student" })
      .count("* as count");
    const [{ count: alumniCount }] = await db("users")
      .where({ role: "alumni" })
      .count("* as count");
    const [{ count: pendingAlumni }] = await db("users")
      .where({ role: "alumni" })
      .andWhere((qb) => qb.where({ status: "pending" }).orWhereNull("status"))
      .count("* as count");

    // count companies in a case-insensitive way so "Approved"/"approved" both count
    const [{ count: approvedCompanies }] = await db("companies")
      .whereRaw("LOWER(status) = 'approved'")
      .count("* as count");
    const [{ count: pendingCompanies }] = await db("companies")
      .whereRaw("status IS NULL OR LOWER(status) = 'pending'")
      .count("* as count");

    const [{ count: totalJobs }] = await db("jobs").count("* as count");
    const [{ count: activeJobs }] = await db("jobs")
      .where({ status: "active" })
      .count("* as count");

    res.json({
      totalUsers: Number(totalUsers || 0),
      studentsCount: Number(studentsCount || 0),
      alumniCount: Number(alumniCount || 0),
      pendingAlumni: Number(pendingAlumni || 0),
      approvedCompanies: Number(approvedCompanies || 0),
      pendingCompanies: Number(pendingCompanies || 0),
      totalJobs: Number(totalJobs || 0),
      activeJobs: Number(activeJobs || 0),
    });
  } catch (error) {
    console.error("getAdminStats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
