// src/controllers/JobController.js
const knex = require("../config/db");

// ---------- Helpers ----------
function getAlumniProfileId(req) {
  return req.user.alumni_profile_id; // adjust if different
}
// src/controllers/jobController.js
const db = require("../config/db");
const cloudinary = require("../config/cloudinary");

// ---------- Helpers ----------
const normalizeListText = (value) => {
  if (value == null) return null;
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return String(value);
};

const toNumberOrNull = (val) => {
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
};

const buildJobPayload = (body, companyId, alumniId) => ({
  ...(companyId && { company_id: companyId }),
  ...(alumniId && { alumni_id: alumniId }),

  job_title: body.job_title,
  job_description: body.job_description,
  job_type: body.job_type || null,
  location: body.location || null,
  salary_range: body.salary_range || null,
  experience_required: body.experience_required || null,
  skills_required: body.skills_required || null,
  stipend: body.stipend || null,
  application_deadline: body.application_deadline || null,

  max_applicants_allowed:
    body.max_applicants_allowed && Number(body.max_applicants_allowed) > 0
      ? Number(body.max_applicants_allowed)
      : 50,

  allowed_branches: normalizeListText(body.allowed_branches),
  nice_to_have_skills: normalizeListText(body.nice_to_have_skills),
  work_mode: body.work_mode || null,
  number_of_openings: toNumberOrNull(body.number_of_openings),
  custom_questions: normalizeListText(body.custom_questions),
  nda_required: body.nda_required === true || body.nda_required === "true",
  ctc_type: body.ctc_type || null,
  min_ctc: toNumberOrNull(body.min_ctc),
  max_ctc: toNumberOrNull(body.max_ctc),
  key_responsibilities: normalizeListText(body.key_responsibilities),
  requirements: normalizeListText(body.requirements),
});

function getUserId(req) {
  return req.user.id;
}

async function findOwnedJob(jobId, alumniProfileId) {
  return knex("jobs").where({ id: jobId, alumni_id: alumniProfileId }).first();
}

// ================== ALUMNI SIDE: JOB MANAGEMENT ==================

// 1. Post a new job
exports.postJob = async (req, res) => {
  try {
    const alumniProfileId = getAlumniProfileId(req);

    const payload = buildJobPayload(req.body, company.id, alumniProfile.id);

    if (!payload.job_title || !payload.job_description) {
      return res
        .status(400)
        .json({ error: "job_title and job_description are required." });
    }

    const [job] = await db("jobs")
      .insert(
        {
          ...payload,
          status: "active",
        },
        "*"
      )
      .returning("*");

    return res.status(201).json({
      message: "Job posted successfully.",
      job: newJob,
    });
  } catch (error) {
    console.error("Error in postJob:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 2. Get jobs posted by logged-in alumni
exports.getMyJobs = async (req, res) => {
  try {
    const alumniProfileId = getAlumniProfileId(req);

    const { status, search, page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;
    const offset = (pageNumber - 1) * pageSize;
    // Join companies + count applications (for ActivePostings UI)
    const jobs = await db("jobs as j")
      .leftJoin("companies as c", "j.company_id", "c.id")
      .leftJoin("job_applications as ja", "j.id", "ja.job_id")
      .where("j.alumni_id", alumniProfile.id)
      .groupBy("j.id", "c.name")
      .orderBy("j.created_at", "desc")
      .select("j.*", "c.name as company_name")
      .count({ applicant_count: "ja.id" });

    const baseQuery = knex("jobs").where("alumni_id", alumniProfileId);

    if (status) {
      baseQuery.andWhere("status", status);
    }

    if (search) {
      baseQuery.andWhere((qb) => {
        qb.whereILike("job_title", `%${search}%`)
          .orWhereILike("location", `%${search}%`)
          .orWhereILike("skills_required", `%${search}%`);
      });
    }

    const jobsQuery = baseQuery
      .clone()
      .orderBy("created_at", "desc")
      .limit(pageSize)
      .offset(offset);

    const countQuery = baseQuery.clone().count("* as total");

    const [jobs, countResult] = await Promise.all([jobsQuery, countQuery]);
    const total = Number(countResult[0]?.total || 0);
    const normalizedUpdate = {
      ...updateData,
      allowed_branches: normalizeListText(updateData.allowed_branches),
      nice_to_have_skills: normalizeListText(updateData.nice_to_have_skills),
      work_mode: updateData.work_mode || null,
      number_of_openings: toNumberOrNull(updateData.number_of_openings),
      custom_questions: normalizeListText(updateData.custom_questions),
      nda_required:
        updateData.nda_required === true || updateData.nda_required === "true",
      ctc_type: updateData.ctc_type || null,
      min_ctc: toNumberOrNull(updateData.min_ctc),
      max_ctc: toNumberOrNull(updateData.max_ctc),
      key_responsibilities: normalizeListText(updateData.key_responsibilities),
      requirements: normalizeListText(updateData.requirements),
    };

    await db("jobs").where({ id }).update(normalizedUpdate);

    return res.status(200).json({
      jobs,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error in getMyJobs:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 3. Get single job (owned by alumni)
exports.getMyJobById = async (req, res) => {
  try {
    const alumniProfileId = getAlumniProfileId(req);
    const { jobId } = req.params;

    const job = await findOwnedJob(jobId, alumniProfileId);
    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found or not owned by you." });
    }

    return res.status(200).json({ job });
  } catch (error) {
    console.error("Error in getMyJobById:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 4. Update job (full + partial)
exports.updateJob = async (req, res) => {
  try {
    const alumniProfileId = getAlumniProfileId(req);
    const { jobId } = req.params;

    const job = await findOwnedJob(jobId, alumniProfileId);
    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found or not owned by you." });
    }

    const allowedFields = [
      "company_id",
      "job_title",
      "job_description",
      "job_type",
      "location",
      "salary_range",
      "experience_required",
      "skills_required",
      "stipend",
      "application_deadline",
      "allowed_branches",
      "nice_to_have_skills",
      "work_mode",
      "number_of_openings",
      "custom_questions",
      "nda_required",
      "ctc_type",
      "min_ctc",
      "max_ctc",
      "key_responsibilities",
      "requirements",
      "max_applicants_allowed",
      "status",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update." });
    }

    updateData.updated_at = knex.fn.now();

    const [updatedJob] = await knex("jobs")
      .where({ id: jobId, alumni_id: alumniProfileId })
      .update(updateData)
      .returning("*");

    return res.status(200).json({
      message: "Job updated successfully.",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error in updateJob:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 5. Delete job
exports.deleteJob = async (req, res) => {
  try {
    const alumniProfileId = getAlumniProfileId(req);
    const { jobId } = req.params;

    const job = await findOwnedJob(jobId, alumniProfileId);
    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found or not owned by you." });
    }

    await knex("jobs").where({ id: jobId, alumni_id: alumniProfileId }).del();

    return res.status(200).json({ message: "Job deleted successfully." });
  } catch (error) {
    console.error("Error in deleteJob:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 6. Repost / duplicate job
exports.repostJob = async (req, res) => {
  try {
    const alumniProfileId = getAlumniProfileId(req);
    const { jobId } = req.params;

    const existingJob = await findOwnedJob(jobId, alumniProfileId);
    if (!existingJob) {
      return res
        .status(404)
        .json({ message: "Job not found or not owned by you." });
    }

    const {
      application_deadline: newDeadline,
      status,
      ...restBody
    } = req.body || {};

    const jobToCopy = { ...existingJob };
    delete jobToCopy.id;
    delete jobToCopy.created_at;
    delete jobToCopy.updated_at;

    const insertData = {
      ...jobToCopy,
      ...restBody,
      application_deadline: newDeadline || existingJob.application_deadline,
      status: status || "active",
      alumni_id: alumniProfileId,
    };

    const [newJob] = await knex("jobs").insert(insertData).returning("*");

    return res.status(201).json({
      message: "Job reposted successfully.",
      job: newJob,
    });
  } catch (error) {
    console.error("Error in repostJob:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ================== STUDENT SIDE: JOB BROWSING ==================

// 7. Get all active jobs (for students)
exports.getAllActiveJobs = async (req, res) => {
  try {
    const {
      search,
      job_type,
      work_mode,
      location: locationQuery,
      page = 1,
      limit = 10,
    } = req.query;
    const jobs = await db("jobs")
      .where("status", "active")
      .orderBy("created_at", "desc");

    return res.json({ jobs });
  } catch (err) {
    console.error("getAllJobsStudent error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 15. getJobByIdStudent
exports.getJobByIdStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await db("jobs as j")
      .leftJoin("companies as c", "j.company_id", "c.id")
      .select(
        "j.*",
        "c.name as company_name",
        "c.website as company_website",
        "c.industry as company_industry",
        "c.company_size",
        "c.about as company_about"
      )
      .where("j.id", id)
      .first();

    if (!job) {
      return res.status(404).json({ error: "Job not found." });
    }

    return res.json({ job });
  } catch (err) {
    console.error("getJobByIdStudent error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 16. applyJob (with Cloudinary resume upload)
exports.applyJob = async (req, res) => {
  const userId = req.user?.id;
  const { job_id } = req.body;

  if (!userId || req.user.role !== "student") {
    return res.status(403).json({ error: "Only students can apply to jobs." });
  }

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;
    const offset = (pageNumber - 1) * pageSize;

    const baseQuery = knex("jobs as j")
      .join("companies as c", "j.company_id", "c.id")
      .leftJoin("alumni_profiles as ap", "j.alumni_id", "ap.id")
      .where("j.status", "active");

    if (job_type) {
      baseQuery.andWhere("j.job_type", job_type);
    }

    if (work_mode) {
      baseQuery.andWhere("j.work_mode", work_mode);
    }

    if (locationQuery) {
      baseQuery.andWhereILike("j.location", `%${locationQuery}%`);
    }

    if (search) {
      baseQuery.andWhere((qb) => {
        qb.whereILike("j.job_title", `%${search}%`)
          .orWhereILike("j.location", `%${search}%`)
          .orWhereILike("j.skills_required", `%${search}%`)
          .orWhereILike("c.name", `%${search}%`);
      });
    }

    const jobsQuery = baseQuery
      .clone()
      .select(
        "j.*",
        "c.name as company_name",
        "ap.name as posted_by_alumni_name"
      )
      .orderBy("j.created_at", "desc")
      .limit(pageSize)
      .offset(offset);

    const countQuery = baseQuery.clone().count("j.id as total");

    const [jobs, countResult] = await Promise.all([jobsQuery, countQuery]);
    const total = Number(countResult[0]?.total || 0);

    return res.status(200).json({
      jobs,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error("applyJob error:", err);
    if (err.message === "You have already applied to this job.") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Server error" });
  }
};

// 17. withdrawJobApplication
exports.withdrawJobApplication = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { applicationId } = req.params;

    if (!userId || req.user.role !== "student") {
      return res
        .status(403)
        .json({ error: "Only students can withdraw applications." });
    }

    const application = await db("job_applications")
      .where({ id: applicationId, user_id: userId })
      .first();

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    await db("job_applications").where({ id: applicationId }).del();

    return res.json({ message: "Application withdrawn successfully." });
  } catch (err) {
    console.error("withdrawJobApplication error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 8. Get single job details (for students + already_applied flag)
exports.getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = getUserId(req);

    const job = await knex("jobs as j")
      .join("companies as c", "j.company_id", "c.id")
      .leftJoin("alumni_profiles as ap", "j.alumni_id", "ap.id")
      .where("j.id", jobId)
      .select(
        "j.*",
        "c.name as company_name",
        "ap.name as posted_by_alumni_name"
      )
      .first();

    if (!job || job.status !== "active") {
      return res.status(404).json({ message: "Job not found or not active." });
    }

    const existingApplication = await knex("job_applications")
      .where({ job_id: jobId, user_id: userId })
      .first();

    return res.status(200).json({
      job,
      already_applied: !!existingApplication,
      application_status: existingApplication?.status || null,
    });
  } catch (error) {
    console.error("Error in getJobDetails:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
