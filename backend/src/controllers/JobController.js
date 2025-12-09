// src/controllers/JobController.js
const knex = require("../config/db");

// ---------- Helpers ----------
function getAlumniProfileId(req) {
  return req.user.alumni_profile_id; // adjust if different
}

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

    const {
      company_id,
      job_title,
      job_description,
      job_type,
      location,
      salary_range,
      experience_required,
      skills_required,
      stipend,
      application_deadline,
      allowed_branches,
      nice_to_have_skills,
      work_mode,
      number_of_openings,
      custom_questions,
      nda_required,
      ctc_type,
      min_ctc,
      max_ctc,
      key_responsibilities,
      requirements,
      max_applicants_allowed,
      status,
    } = req.body;

    if (!company_id || !job_title || !job_description) {
      return res.status(400).json({
        message: "company_id, job_title and job_description are required.",
      });
    }

    const [newJob] = await knex("jobs")
      .insert({
        company_id,
        alumni_id: alumniProfileId,
        job_title,
        job_description,
        job_type,
        location,
        salary_range,
        experience_required,
        skills_required,
        stipend,
        application_deadline,
        allowed_branches,
        nice_to_have_skills,
        work_mode,
        number_of_openings,
        custom_questions,
        nda_required,
        ctc_type,
        min_ctc,
        max_ctc,
        key_responsibilities,
        requirements,
        max_applicants_allowed,
        status: status || "active",
      })
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
  } catch (error) {
    console.error("Error in getAllActiveJobs:", error);
    return res.status(500).json({ message: "Internal server error." });
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
