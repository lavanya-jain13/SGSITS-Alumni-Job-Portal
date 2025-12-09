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

// upload a buffer (from multer.memoryStorage) to Cloudinary
const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// get alumni_profile.id for current user
const getAlumniProfileByUserId = async (userId) => {
  return db("alumni_profiles").where({ user_id: userId }).first();
};

// ensure that current user (alumni) owns this job
const ensureJobOwnedByAlumniUser = async (jobId, userId) => {
  const alumniProfile = await getAlumniProfileByUserId(userId);
  if (!alumniProfile) return null;

  const job = await db("jobs")
    .where({ id: jobId, alumni_id: alumniProfile.id })
    .first();

  return job || null;
};

// ---------------------- ALUMNI SIDE ----------------------

// 1. postJob
exports.postJob = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({ error: "Only alumni can post jobs." });
    }

    const alumniProfile = await getAlumniProfileByUserId(userId);
    if (!alumniProfile) {
      return res
        .status(400)
        .json({ error: "Alumni profile not found. Complete profile first." });
    }

    // Find company linked to this alumni (simple version: first company)
    const company = await db("companies")
      .where({ alumni_id: alumniProfile.id })
      .first();

    if (!company) {
      return res.status(400).json({
        error:
          "No company found for your profile. Please submit your company details first.",
      });
    }

    const payload = buildJobPayload(req.body, company.id, alumniProfile.id);

    if (!payload.job_title || !payload.job_description) {
      return res
        .status(400)
        .json({ error: "job_title and job_description are required." });
    }

    const [job] = await db("jobs")
      .insert({
        ...payload,
        status: "active",
      })
      .returning("*");

    return res.status(201).json({ message: "Job posted successfully.", job });
  } catch (err) {
    console.error("postJob error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 2. getMyJobs (alumni)
exports.getMyJobs = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || req.user.role !== "alumni") {
      return res
        .status(403)
        .json({ error: "Only alumni can view their jobs." });
    }

    const alumniProfile = await getAlumniProfileByUserId(userId);
    if (!alumniProfile) {
      return res
        .status(400)
        .json({ error: "Alumni profile not found. Complete profile first." });
    }

    // Join companies + count applications (for ActivePostings UI)
    const jobs = await db("jobs as j")
      .leftJoin("companies as c", "j.company_id", "c.id")
      .leftJoin("job_applications as ja", "j.id", "ja.job_id")
      .where("j.alumni_id", alumniProfile.id)
      .groupBy("j.id", "c.name")
      .orderBy("j.created_at", "desc")
      .select("j.*", "c.name as company_name")
      .count({ applicant_count: "ja.id" });

    return res.json({ jobs });
  } catch (err) {
    console.error("getMyJobs error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 3. getJobById (alumni – only own job)
exports.getJobById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({ error: "Only alumni can view this." });
    }

    const job = await ensureJobOwnedByAlumniUser(id, userId);
    if (!job) {
      return res
        .status(404)
        .json({ error: "Job not found or not owned by you." });
    }

    return res.json({ job });
  } catch (err) {
    console.error("getJobById error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 4. updateJob
exports.updateJob = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({ error: "Only alumni can update jobs." });
    }

    const job = await ensureJobOwnedByAlumniUser(id, userId);
    if (!job) {
      return res
        .status(404)
        .json({ error: "Job not found or not owned by you." });
    }

    const updateData = { ...req.body, updated_at: db.fn.now() };

    // don't allow changing ids
    delete updateData.id;
    delete updateData.company_id;
    delete updateData.alumni_id;

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

    const updated = await db("jobs").where({ id }).first();
    return res.json({ message: "Job updated successfully.", job: updated });
  } catch (err) {
    console.error("updateJob error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 5. deleteJob
exports.deleteJob = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({ error: "Only alumni can delete jobs." });
    }

    const job = await ensureJobOwnedByAlumniUser(id, userId);
    if (!job) {
      return res
        .status(404)
        .json({ error: "Job not found or not owned by you." });
    }

    await db("jobs").where({ id }).del();
    return res.json({ message: "Job deleted successfully." });
  } catch (err) {
    console.error("deleteJob error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 6. repostJob (set status active, optionally change max_applicants_allowed)
exports.repostJob = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { max_applicants_allowed } = req.body;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({ error: "Only alumni can repost jobs." });
    }

    const job = await ensureJobOwnedByAlumniUser(id, userId);
    if (!job) {
      return res
        .status(404)
        .json({ error: "Job not found or not owned by you." });
    }

    const updateObj = {
      status: "active",
      updated_at: db.fn.now(),
    };

    if (max_applicants_allowed && Number(max_applicants_allowed) > 0) {
      updateObj.max_applicants_allowed = Number(max_applicants_allowed);
    }

    await db("jobs").where({ id }).update(updateObj);

    const updated = await db("jobs").where({ id }).first();
    return res.json({ message: "Job reposted.", job: updated });
  } catch (err) {
    console.error("repostJob error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 7. getJobApplicationsCount (per job)
exports.getJobApplicationsCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { jobId } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res
        .status(403)
        .json({ error: "Only alumni can view application counts." });
    }

    const job = await ensureJobOwnedByAlumniUser(jobId, userId);
    if (!job) {
      return res
        .status(404)
        .json({ error: "Job not found or not owned by you." });
    }

    const row = await db("job_applications")
      .where({ job_id: jobId })
      .count("* as count")
      .first();

    return res.json({ jobId, totalApplications: Number(row?.count || 0) });
  } catch (err) {
    console.error("getJobApplicationsCount error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 8. getJobUnreadApplicationsCount
exports.getJobUnreadApplicationsCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { jobId } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res
        .status(403)
        .json({ error: "Only alumni can view unread application counts." });
    }

    const job = await ensureJobOwnedByAlumniUser(jobId, userId);
    if (!job) {
      return res
        .status(404)
        .json({ error: "Job not found or not owned by you." });
    }

    const row = await db("job_applications")
      .where({ job_id: jobId, is_read: false })
      .count("* as count")
      .first();

    return res.json({ jobId, unreadApplications: Number(row?.count || 0) });
  } catch (err) {
    console.error("getJobUnreadApplicationsCount error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 9. viewJobApplicants (detailed list)
exports.viewJobApplicants = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { jobId } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res
        .status(403)
        .json({ error: "Only alumni can view applicants." });
    }

    const job = await ensureJobOwnedByAlumniUser(jobId, userId);
    if (!job) {
      return res
        .status(404)
        .json({ error: "Job not found or not owned by you." });
    }

    const applicants = await db("job_applications as ja")
      .join("users as u", "ja.user_id", "u.id")
      .leftJoin("student_profiles as sp", "sp.user_id", "u.id")
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
        "sp.grad_year as student_grad_year"
      )
      .orderBy("ja.applied_at", "desc");

    return res.json({ jobId, applicants });
  } catch (err) {
    console.error("viewJobApplicants error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 10. markJobApplicationRead
exports.markJobApplicationRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { applicationId } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res
        .status(403)
        .json({ error: "Only alumni can mark applications as read." });
    }

    const application = await db("job_applications")
      .where({ id: applicationId })
      .first();

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    const job = await ensureJobOwnedByAlumniUser(application.job_id, userId);
    if (!job) {
      return res
        .status(403)
        .json({ error: "You are not authorized to modify this job." });
    }

    await db("job_applications")
      .where({ id: applicationId })
      .update({ is_read: true });

    return res.json({ message: "Application marked as read." });
  } catch (err) {
    console.error("markJobApplicationRead error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 11–13. accept / reject / hold job application
const updateJobApplicationStatus = async (req, res, newStatus) => {
  try {
    const userId = req.user?.id;
    const { applicationId } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({
        error: "Only alumni can change job application status.",
      });
    }

    const application = await db("job_applications")
      .where({ id: applicationId })
      .first();

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    const job = await ensureJobOwnedByAlumniUser(application.job_id, userId);
    if (!job) {
      return res
        .status(403)
        .json({ error: "You are not authorized to modify this job." });
    }

    await db("job_applications")
      .where({ id: applicationId })
      .update({ status: newStatus, is_read: true });

    return res.json({
      message: `Application marked as ${newStatus}.`,
    });
  } catch (err) {
    console.error("updateJobApplicationStatus error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.acceptJobApplication = (req, res) =>
  updateJobApplicationStatus(req, res, "accepted");
exports.rejectJobApplication = (req, res) =>
  updateJobApplicationStatus(req, res, "rejected");
exports.holdJobApplication = (req, res) =>
  updateJobApplicationStatus(req, res, "on_hold");

// ---------------------- STUDENT SIDE ----------------------

// 14. getAllJobsStudent
exports.getAllJobsStudent = async (req, res) => {
  try {
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

  if (!job_id) {
    return res.status(400).json({ error: "job_id is required." });
  }

  try {
    // 1) Fetch job
    const job = await db("jobs").where({ id: job_id }).first();
    if (!job) {
      return res.status(404).json({ error: "Job not found." });
    }

    // 2) Check job status
    if (job.status !== "active") {
      return res.status(400).json({
        error: `This job is currently ${job.status} and cannot accept new applications.`,
      });
    }

    // 3) Current applications count
    const countRow = await db("job_applications")
      .where({ job_id })
      .count("id as count")
      .first();
    const currentCount = Number(countRow?.count || 0);

    if (currentCount >= job.max_applicants_allowed) {
      return res.status(400).json({
        error: "Application limit reached for this job.",
      });
    }

    // 4) Check duplicate application
    const existing = await db("job_applications")
      .where({ job_id, user_id: userId })
      .first();
    if (existing) {
      return res
        .status(400)
        .json({ error: "You have already applied to this job." });
    }

    // 5) Handle resume upload
    let resumeUrl = null;
    if (req.file && req.file.buffer) {
      const uploadResult = await uploadBufferToCloudinary(
        req.file.buffer,
        "alumni-portal/resumes"
      );
      resumeUrl = uploadResult.secure_url;
    } else if (req.body.resume_url) {
      resumeUrl = req.body.resume_url;
    } else {
      return res
        .status(400)
        .json({ error: "Resume file (resume) is required." });
    }

    // 6) Do everything in a transaction
    const application = await db.transaction(async (trx) => {
      const [app] = await trx("job_applications")
        .insert(
          {
            job_id,
            user_id: userId,
            resume_url: resumeUrl,
            status: "pending",
            is_read: false,
          },
          ["id", "job_id", "user_id", "resume_url", "status", "applied_at"]
        )
        .catch((err) => {
          if (err.code === "23505") {
            throw new Error("You have already applied to this job.");
          }
          throw err;
        });

      // recalc count and pause if needed
      const newCountRow = await trx("job_applications")
        .where({ job_id })
        .count("id as count")
        .first();
      const newCount = Number(newCountRow?.count || 0);

      if (newCount >= job.max_applicants_allowed) {
        await trx("jobs")
          .where({ id: job_id })
          .update({ status: "paused", updated_at: trx.fn.now() });
      }

      return app;
    });

    return res.status(201).json({
      message: "Job application submitted successfully.",
      application,
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

// 18. getAppliedJobs (student)
exports.getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId || req.user.role !== "student") {
      return res
        .status(403)
        .json({ error: "Only students can view their applied jobs." });
    }

    const rows = await db("job_applications as ja")
      .join("jobs as j", "ja.job_id", "j.id")
      .leftJoin("companies as c", "j.company_id", "c.id")
      .select(
        "ja.id as application_id",
        "ja.status as application_status",
        "ja.applied_at",
        "ja.resume_url",
        "j.id as job_id",
        "j.job_title",
        "j.location",
        "j.status as job_status",
        "c.name as company_name",
        "c.website as company_website"
      )
      .where("ja.user_id", userId)
      .orderBy("ja.applied_at", "desc");

    return res.json({ applications: rows });
  } catch (err) {
    console.error("getAppliedJobs error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 19. checkJobApplicationStatus – has this student already applied?
exports.checkJobApplicationStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { jobId } = req.params;

    if (!userId || req.user.role !== "student") {
      return res
        .status(403)
        .json({ error: "Only students can check application status." });
    }

    const app = await db("job_applications")
      .where({ job_id: jobId, user_id: userId })
      .first();

    if (!app) {
      return res.json({ applied: false });
    }

    return res.json({
      applied: true,
      status: app.status,
      applied_at: app.applied_at,
    });
  } catch (err) {
    console.error("checkJobApplicationStatus error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
