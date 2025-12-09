// src/controllers/JobApplicationController.js
const knex = require("../config/db");

// ---------- Helpers ----------
function getAlumniProfileId(req) {
  return req.user.alumni_profile_id;
}

function getUserId(req) {
  return req.user.id;
}

async function findOwnedJob(jobId, alumniProfileId) {
  return knex("jobs").where({ id: jobId, alumni_id: alumniProfileId }).first();
}

async function findOwnedApplication(applicationId, alumniProfileId) {
  return knex("job_applications as ja")
    .join("jobs as j", "ja.job_id", "j.id")
    .where("ja.id", applicationId)
    .andWhere("j.alumni_id", alumniProfileId)
    .select("ja.*", "j.job_title")
    .first();
}

// ================== STUDENT SIDE: APPLY / MANAGE MY APPLICATIONS ==================

// 1. Apply to a job
exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = getUserId(req);
    const { resume_url } = req.body;

    if (!resume_url) {
      return res.status(400).json({ message: "resume_url is required." });
    }

    const job = await knex("jobs").where("id", jobId).first();
    if (!job || job.status !== "active") {
      return res.status(404).json({ message: "Job not found or not active." });
    }

    if (job.application_deadline) {
      const today = new Date();
      const deadline = new Date(job.application_deadline);
      if (today > deadline) {
        return res.status(400).json({
          message: "Application deadline is over for this job.",
        });
      }
    }

    if (job.max_applicants_allowed && job.max_applicants_allowed > 0) {
      const countRes = await knex("job_applications")
        .where("job_id", jobId)
        .count("* as total")
        .first();
      const totalApplications = Number(countRes?.total || 0);
      if (totalApplications >= job.max_applicants_allowed) {
        return res.status(400).json({
          message: "Maximum number of applications reached for this job.",
        });
      }
    }

    const existingApplication = await knex("job_applications")
      .where({ job_id: jobId, user_id: userId })
      .first();

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied to this job.",
      });
    }

    const [newApplication] = await knex("job_applications")
      .insert({
        job_id: jobId,
        user_id: userId,
        resume_url,
        status: "pending",
        is_read: false,
      })
      .returning("*");

    return res.status(201).json({
      message: "Applied to job successfully.",
      application: newApplication,
    });
  } catch (error) {
    console.error("Error in applyToJob:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 2. Get all my job applications
exports.getMyJobApplications = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { status, page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;
    const offset = (pageNumber - 1) * pageSize;

    const baseQuery = knex("job_applications as ja")
      .join("jobs as j", "ja.job_id", "j.id")
      .join("companies as c", "j.company_id", "c.id")
      .where("ja.user_id", userId);

    if (status) {
      baseQuery.andWhere("ja.status", status);
    }

    const applicationsQuery = baseQuery
      .clone()
      .select(
        "ja.*",
        "j.job_title",
        "j.location",
        "j.job_type",
        "c.name as company_name"
      )
      .orderBy("ja.applied_at", "desc")
      .limit(pageSize)
      .offset(offset);

    const countQuery = baseQuery.clone().count("ja.id as total");

    const [applications, countResult] = await Promise.all([
      applicationsQuery,
      countQuery,
    ]);

    const total = Number(countResult[0]?.total || 0);

    return res.status(200).json({
      applications,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error in getMyJobApplications:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 3. Get single my job application
exports.getMySingleJobApplication = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { applicationId } = req.params;

    const application = await knex("job_applications as ja")
      .join("jobs as j", "ja.job_id", "j.id")
      .join("companies as c", "j.company_id", "c.id")
      .where("ja.id", applicationId)
      .andWhere("ja.user_id", userId)
      .select(
        "ja.*",
        "j.job_title",
        "j.location",
        "j.job_type",
        "c.name as company_name"
      )
      .first();

    if (!application) {
      return res.status(404).json({
        message: "Application not found for this user.",
      });
    }

    return res.status(200).json({ application });
  } catch (error) {
    console.error("Error in getMySingleJobApplication:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 4. Withdraw my application (if pending)
exports.withdrawJobApplication = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { applicationId } = req.params;

    const application = await knex("job_applications")
      .where({ id: applicationId, user_id: userId })
      .first();

    if (!application) {
      return res.status(404).json({
        message: "Application not found for this user.",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        message: "You can withdraw only pending applications.",
      });
    }

    await knex("job_applications")
      .where({ id: applicationId, user_id: userId })
      .del();

    return res.status(200).json({
      message: "Application withdrawn successfully.",
    });
  } catch (error) {
    console.error("Error in withdrawJobApplication:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ================== ALUMNI SIDE: MANAGE APPLICATIONS ON THEIR JOBS ==================

// 5. Get applications for a specific job
exports.getApplicationsForJob = async (req, res) => {
  try {
    const alumniProfileId = getAlumniProfileId(req);
    const { jobId } = req.params;
    const { status, is_read, search, page = 1, limit = 10 } = req.query;

    const job = await findOwnedJob(jobId, alumniProfileId);
    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found or not owned by you." });
    }

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;
    const offset = (pageNumber - 1) * pageSize;

    const baseQuery = knex("job_applications as ja")
      .join("jobs as j", "ja.job_id", "j.id")
      .join("users as u", "ja.user_id", "u.id")
      .leftJoin("student_profiles as sp", "u.id", "sp.user_id")
      .where("ja.job_id", jobId)
      .andWhere("j.alumni_id", alumniProfileId);

    if (status) {
      baseQuery.andWhere("ja.status", status);
    }

    if (typeof is_read !== "undefined") {
      if (is_read === "true" || is_read === true) {
        baseQuery.andWhere("ja.is_read", true);
      } else if (is_read === "false" || is_read === false) {
        baseQuery.andWhere("ja.is_read", false);
      }
    }

    if (search) {
      baseQuery.andWhere((qb) => {
        qb.whereILike("u.email", `%${search}%`).orWhereILike(
          "sp.name",
          `%${search}%`
        );
      });
    }

    const applicationsQuery = baseQuery
      .clone()
      .select(
        "ja.*",
        "u.email as applicant_email",
        "sp.name as applicant_name",
        "j.job_title"
      )
      .orderBy("ja.applied_at", "desc")
      .limit(pageSize)
      .offset(offset);

    const countQuery = baseQuery.clone().count("ja.id as total");

    const [applications, countResult] = await Promise.all([
      applicationsQuery,
      countQuery,
    ]);

    const total = Number(countResult[0]?.total || 0);

    return res.status(200).json({
      applications,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error in getApplicationsForJob:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 6. Get single application (for alumni job)
exports.getApplicationById = async (req, res) => {
  try {
    const alumniProfileId = getAlumniProfileId(req);
    const { applicationId } = req.params;

    const application = await knex("job_applications as ja")
      .join("jobs as j", "ja.job_id", "j.id")
      .join("users as u", "ja.user_id", "u.id")
      .leftJoin("student_profiles as sp", "u.id", "sp.user_id")
      .where("ja.id", applicationId)
      .andWhere("j.alumni_id", alumniProfileId)
      .select(
        "ja.*",
        "j.job_title",
        "u.email as applicant_email",
        "sp.name as applicant_name"
      )
      .first();

    if (!application) {
      return res
        .status(404)
        .json({ message: "Application not found or not for your job." });
    }

    return res.status(200).json({ application });
  } catch (error) {
    console.error("Error in getApplicationById:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 7. Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const alumniProfileId = getAlumniProfileId(req);
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "status is required." });
    }

    const validStatuses = ["pending", "accepted", "rejected", "on_hold"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    const existing = await findOwnedApplication(applicationId, alumniProfileId);
    if (!existing) {
      return res
        .status(404)
        .json({ message: "Application not found or not for your job." });
    }

    const [updated] = await knex("job_applications")
      .where({ id: applicationId })
      .update({ status, is_read: true })
      .returning("*");

    return res.status(200).json({
      message: "Application status updated.",
      application: updated,
    });
  } catch (error) {
    console.error("Error in updateApplicationStatus:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 8. Mark application as read
exports.markApplicationAsRead = async (req, res) => {
  try {
    const alumniProfileId = getAlumniProfileId(req);
    const { applicationId } = req.params;

    const existing = await findOwnedApplication(applicationId, alumniProfileId);
    if (!existing) {
      return res
        .status(404)
        .json({ message: "Application not found or not for your job." });
    }

    const [updated] = await knex("job_applications")
      .where({ id: applicationId })
      .update({ is_read: true })
      .returning("*");

    return res.status(200).json({
      message: "Application marked as read.",
      application: updated,
    });
  } catch (error) {
    console.error("Error in markApplicationAsRead:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 9. Bulk update application status for a job
exports.bulkUpdateApplicationStatus = async (req, res) => {
  try {
    const alumniProfileId = getAlumniProfileId(req);
    const { jobId } = req.params;
    const { application_ids, status } = req.body;

    if (!Array.isArray(application_ids) || application_ids.length === 0) {
      return res
        .status(400)
        .json({ message: "application_ids array is required." });
    }

    if (!status) {
      return res.status(400).json({ message: "status is required." });
    }

    const validStatuses = ["pending", "accepted", "rejected", "on_hold"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    const job = await findOwnedJob(jobId, alumniProfileId);
    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found or not owned by you." });
    }

    const updatedCount = await knex("job_applications as ja")
      .join("jobs as j", "ja.job_id", "j.id")
      .where("ja.job_id", jobId)
      .andWhere("j.alumni_id", alumniProfileId)
      .whereIn("ja.id", application_ids)
      .update({ status, is_read: true });

    return res.status(200).json({
      message: "Application statuses updated.",
      updated_count: updatedCount,
    });
  } catch (error) {
    console.error("Error in bulkUpdateApplicationStatus:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 10. Dashboard summary for alumni jobs & applications
exports.getAlumniJobsDashboardSummary = async (req, res) => {
  try {
    const alumniProfileId = getAlumniProfileId(req);

    const jobsCounts = await knex("jobs")
      .where("alumni_id", alumniProfileId)
      .count("* as total_jobs")
      .count({
        active_jobs: knex.raw("CASE WHEN status = 'active' THEN 1 END"),
      })
      .first();

    const appsCounts = await knex("job_applications as ja")
      .join("jobs as j", "ja.job_id", "j.id")
      .where("j.alumni_id", alumniProfileId)
      .count("ja.id as total_applications")
      .count({
        unread_applications: knex.raw(
          "CASE WHEN ja.is_read = false THEN 1 END"
        ),
      })
      .first();

    const perJobStats = await knex("jobs as j")
      .leftJoin("job_applications as ja", "j.id", "ja.job_id")
      .where("j.alumni_id", alumniProfileId)
      .groupBy("j.id", "j.job_title", "j.status")
      .select(
        "j.id as job_id",
        "j.job_title",
        "j.status",
        knex.raw("COUNT(ja.id) as applications_count"),
        knex.raw(
          "SUM(CASE WHEN ja.is_read = false THEN 1 ELSE 0 END) as unread_count"
        )
      )
      .orderBy("j.created_at", "desc");

    return res.status(200).json({
      total_jobs: Number(jobsCounts?.total_jobs || 0),
      active_jobs: Number(jobsCounts?.active_jobs || 0),
      total_applications: Number(appsCounts?.total_applications || 0),
      unread_applications: Number(appsCounts?.unread_applications || 0),
      per_job_stats: perJobStats,
    });
  } catch (error) {
    console.error("Error in getAlumniJobsDashboardSummary:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
