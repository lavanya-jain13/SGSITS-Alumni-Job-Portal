// src/controllers/projectController.js
const db = require("../config/db");
const cloudinary = require("../config/cloudinary");

// ---------- Helpers ----------

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

// ensure that current user (alumni) owns this project
const ensureProjectOwnedByAlumniUser = async (projectId, userId) => {
  const alumniProfile = await getAlumniProfileByUserId(userId);
  if (!alumniProfile) return null;

  const project = await db("project_posts")
    .where({ id: projectId, alumni_id: alumniProfile.id })
    .first();

  return project || null;
};

// ---------------------- ALUMNI SIDE ----------------------

// 1. postProject
exports.postProject = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({ error: "Only alumni can post projects." });
    }

    const alumniProfile = await getAlumniProfileByUserId(userId);
    if (!alumniProfile) {
      return res
        .status(400)
        .json({ error: "Alumni profile not found. Complete profile first." });
    }

    const {
      project_title,
      project_description,
      stipend,
      skills_required,
      duration,
      max_applicants_allowed,
    } = req.body;

    if (!project_title || !project_description) {
      return res.status(400).json({
        error: "project_title and project_description are required.",
      });
    }

    const [project] = await db("project_posts")
      .insert(
        {
          alumni_id: alumniProfile.id,
          project_title,
          project_description,
          stipend: stipend || null,
          skills_required: skills_required || null,
          duration: duration || null,
          max_applicants_allowed:
            max_applicants_allowed && Number(max_applicants_allowed) > 0
              ? Number(max_applicants_allowed)
              : 50,
          status: "active",
        },
        "*"
      )
      .returning("*");

    return res.status(201).json({
      message: "Project posted successfully.",
      project,
    });
  } catch (err) {
    console.error("postProject error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 2. getMyProjects (alumni)
exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || req.user.role !== "alumni") {
      return res
        .status(403)
        .json({ error: "Only alumni can view their projects." });
    }

    const alumniProfile = await getAlumniProfileByUserId(userId);
    if (!alumniProfile) {
      return res
        .status(400)
        .json({ error: "Alumni profile not found. Complete profile first." });
    }

    const projects = await db("project_posts")
      .where({ alumni_id: alumniProfile.id })
      .orderBy("created_at", "desc");

    return res.json({ projects });
  } catch (err) {
    console.error("getMyProjects error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 3. getProjectById (alumni – only own project)
exports.getProjectById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({ error: "Only alumni can view this." });
    }

    const project = await ensureProjectOwnedByAlumniUser(id, userId);
    if (!project) {
      return res.status(404).json({
        error: "Project not found or not owned by you.",
      });
    }

    return res.json({ project });
  } catch (err) {
    console.error("getProjectById error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 4. updateProject
exports.updateProject = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({ error: "Only alumni can update projects." });
    }

    const project = await ensureProjectOwnedByAlumniUser(id, userId);
    if (!project) {
      return res.status(404).json({
        error: "Project not found or not owned by you.",
      });
    }

    const updateData = { ...req.body, updated_at: db.fn.now() };

    delete updateData.id;
    delete updateData.alumni_id;

    await db("project_posts").where({ id }).update(updateData);

    const updated = await db("project_posts").where({ id }).first();
    return res.json({
      message: "Project updated successfully.",
      project: updated,
    });
  } catch (err) {
    console.error("updateProject error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 5. deleteProject
exports.deleteProject = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({ error: "Only alumni can delete projects." });
    }

    const project = await ensureProjectOwnedByAlumniUser(id, userId);
    if (!project) {
      return res.status(404).json({
        error: "Project not found or not owned by you.",
      });
    }

    await db("project_posts").where({ id }).del();
    return res.json({ message: "Project deleted successfully." });
  } catch (err) {
    console.error("deleteProject error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 6. repostProject
exports.repostProject = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { max_applicants_allowed } = req.body;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({ error: "Only alumni can repost projects." });
    }

    const project = await ensureProjectOwnedByAlumniUser(id, userId);
    if (!project) {
      return res.status(404).json({
        error: "Project not found or not owned by you.",
      });
    }

    const updateObj = {
      status: "active",
      updated_at: db.fn.now(),
    };

    if (max_applicants_allowed && Number(max_applicants_allowed) > 0) {
      updateObj.max_applicants_allowed = Number(max_applicants_allowed);
    }

    await db("project_posts").where({ id }).update(updateObj);

    const updated = await db("project_posts").where({ id }).first();
    return res.json({ message: "Project reposted.", project: updated });
  } catch (err) {
    console.error("repostProject error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 7. getProjectApplicationsCount
exports.getProjectApplicationsCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { projectId } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({
        error: "Only alumni can view application counts.",
      });
    }

    const project = await ensureProjectOwnedByAlumniUser(projectId, userId);
    if (!project) {
      return res.status(404).json({
        error: "Project not found or not owned by you.",
      });
    }

    const row = await db("project_applications")
      .where({ project_id: projectId })
      .count("* as count")
      .first();

    return res.json({
      projectId,
      totalApplications: Number(row?.count || 0),
    });
  } catch (err) {
    console.error("getProjectApplicationsCount error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 8. getProjectUnreadApplicationsCount
exports.getProjectUnreadApplicationsCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { projectId } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({
        error: "Only alumni can view unread application counts.",
      });
    }

    const project = await ensureProjectOwnedByAlumniUser(projectId, userId);
    if (!project) {
      return res.status(404).json({
        error: "Project not found or not owned by you.",
      });
    }

    const row = await db("project_applications")
      .where({ project_id: projectId, is_read: false })
      .count("* as count")
      .first();

    return res.json({
      projectId,
      unreadApplications: Number(row?.count || 0),
    });
  } catch (err) {
    console.error("getProjectUnreadApplicationsCount error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 9. viewProjectApplicants
exports.viewProjectApplicants = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { projectId } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({ error: "Only alumni can view applicants." });
    }

    const project = await ensureProjectOwnedByAlumniUser(projectId, userId);
    if (!project) {
      return res.status(404).json({
        error: "Project not found or not owned by you.",
      });
    }

    const applicants = await db("project_applications as pa")
      .join("users as u", "pa.user_id", "u.id")
      .leftJoin("student_profiles as sp", "sp.user_id", "u.id")
      .select(
        "pa.id as application_id",
        "pa.status as application_status",
        "pa.is_read",
        "pa.resume_url",
        "pa.applied_at",
        "u.id as user_id",
        "u.email as user_email",
        "sp.name as student_name",
        "sp.branch as student_branch",
        "sp.grad_year as student_grad_year"
      )
      .where("pa.project_id", projectId)
      .orderBy("pa.applied_at", "desc");

    return res.json({ projectId, applicants });
  } catch (err) {
    console.error("viewProjectApplicants error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 10. markProjectApplicationRead
exports.markProjectApplicationRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { applicationId } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({
        error: "Only alumni can mark applications as read.",
      });
    }

    const application = await db("project_applications")
      .where({ id: applicationId })
      .first();

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    const project = await ensureProjectOwnedByAlumniUser(
      application.project_id,
      userId
    );
    if (!project) {
      return res.status(403).json({
        error: "You are not authorized to modify this project.",
      });
    }

    await db("project_applications")
      .where({ id: applicationId })
      .update({ is_read: true });

    return res.json({ message: "Application marked as read." });
  } catch (err) {
    console.error("markProjectApplicationRead error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 11–13. accept / reject / hold project application
const updateProjectApplicationStatus = async (req, res, newStatus) => {
  try {
    const userId = req.user?.id;
    const { applicationId } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({
        error: "Only alumni can change project application status.",
      });
    }

    const application = await db("project_applications")
      .where({ id: applicationId })
      .first();

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    const project = await ensureProjectOwnedByAlumniUser(
      application.project_id,
      userId
    );

    if (!project) {
      return res.status(403).json({
        error: "You are not authorized to modify this project.",
      });
    }

    await db("project_applications")
      .where({ id: applicationId })
      .update({ status: newStatus, is_read: true });

    return res.json({
      message: `Application marked as ${newStatus}.`,
    });
  } catch (err) {
    console.error("updateProjectApplicationStatus error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ---------------------- STUDENT SIDE ----------------------

// 14. getAllProjectsStudent
exports.getAllProjectsStudent = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const baseQuery = db("project_posts")
      .where("status", "active")
      .select(
        "id",
        "title",
        "description",
        "location",
        "project_type",
        "created_at",
        "updated_at",
        "application_deadline",
        "max_applicants_allowed",
        "status"
      );

    const [projects, [{ total }]] = await Promise.all([
      baseQuery.clone().orderBy("created_at", "desc").limit(limit).offset(offset),
      baseQuery.clone().clearSelect().count({ total: "*" }),
    ]);

    return res.json({
      projects,
      page,
      limit,
      total: Number(total),
    });
  } catch (err) {
    console.error("getAllProjectsStudent error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 15. getProjectByIdStudent
exports.getProjectByIdStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await db("project_posts").where({ id }).first();

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    return res.json({ project });
  } catch (err) {
    console.error("getProjectByIdStudent error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 16. applyProject (with Cloudinary resume upload)
exports.applyProject = async (req, res) => {
  const userId = req.user?.id;
  const { project_id } = req.body;

  if (!userId || req.user.role !== "student") {
    return res
      .status(403)
      .json({ error: "Only students can apply to projects." });
  }

  if (!project_id) {
    return res.status(400).json({ error: "project_id is required." });
  }

  try {
    // 1) Fetch project
    const project = await db("project_posts").where({ id: project_id }).first();
    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    // 2) Check status
    if (project.status !== "active") {
      return res.status(400).json({
        error: `This project is currently ${project.status} and cannot accept new applications.`,
      });
    }

    // 3) Current applications count
    const countRow = await db("project_applications")
      .where({ project_id })
      .count("id as count")
      .first();
    const currentCount = Number(countRow?.count || 0);

    if (currentCount >= project.max_applicants_allowed) {
      return res.status(400).json({
        error: "Application limit reached for this project.",
      });
    }

    // 4) Duplicate application check
    const existing = await db("project_applications")
      .where({ project_id, user_id: userId })
      .first();
    if (existing) {
      return res
        .status(400)
        .json({ error: "You have already applied to this project." });
    }

    // 5) Resume upload
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

    // 6) Transaction
    const application = await db.transaction(async (trx) => {
      const [app] = await trx("project_applications")
        .insert(
          {
            project_id,
            user_id: userId,
            resume_url: resumeUrl,
            status: "pending",
            is_read: false,
          },
          ["id", "project_id", "user_id", "resume_url", "status", "applied_at"]
        )
        .catch((err) => {
          if (err.code === "23505") {
            throw new Error("You have already applied to this project.");
          }
          throw err;
        });

      const newCountRow = await trx("project_applications")
        .where({ project_id })
        .count("id as count")
        .first();
      const newCount = Number(newCountRow?.count || 0);

      if (newCount >= project.max_applicants_allowed) {
        await trx("project_posts")
          .where({ id: project_id })
          .update({ status: "paused", updated_at: trx.fn.now() });
      }

      return app;
    });

    return res.status(201).json({
      message: "Project application submitted successfully.",
      application,
    });
  } catch (err) {
    console.error("applyProject error:", err);
    if (err.message === "You have already applied to this project.") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Server error" });
  }
};

// 17. withdrawProjectApplication
exports.withdrawProjectApplication = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { applicationId } = req.params;

    if (!userId || req.user.role !== "student") {
      return res.status(403).json({
        error: "Only students can withdraw project applications.",
      });
    }

    const application = await db("project_applications")
      .where({ id: applicationId, user_id: userId })
      .first();

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    await db("project_applications").where({ id: applicationId }).del();

    return res.json({ message: "Project application withdrawn successfully." });
  } catch (err) {
    console.error("withdrawProjectApplication error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 18. getAppliedProjects
exports.getAppliedProjects = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId || req.user.role !== "student") {
      return res.status(403).json({
        error: "Only students can view their applied projects.",
      });
    }

    const rows = await db("project_applications as pa")
      .join("project_posts as p", "pa.project_id", "p.id")
      .leftJoin("alumni_profiles as a", "p.alumni_id", "a.id")
      .select(
        "pa.id as application_id",
        "pa.status as application_status",
        "pa.applied_at",
        "pa.resume_url",
        "p.id as project_id",
        "p.project_title",
        "p.duration",
        "p.status as project_status",
        "a.name as alumni_name",
        "a.grad_year as alumni_grad_year"
      )
      .where("pa.user_id", userId)
      .orderBy("pa.applied_at", "desc");

    return res.json({ applications: rows });
  } catch (err) {
    console.error("getAppliedProjects error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 19. checkProjectApplicationStatus
exports.checkProjectApplicationStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { projectId } = req.params;

    if (!userId || req.user.role !== "student") {
      return res.status(403).json({
        error: "Only students can check project application status.",
      });
    }

    const app = await db("project_applications")
      .where({ project_id: projectId, user_id: userId })
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
    console.error("checkProjectApplicationStatus error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
