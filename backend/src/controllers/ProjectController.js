// src/controllers/ProjectController.js
const knex = require("../config/db");

// ---------- Helpers ----------
function getAlumniProfileId(req) {
  return req.user.alumni_profile_id; // adjust if different
}

function getUserId(req) {
  return req.user.id;
}

async function findOwnedProject(projectId, alumniProfileId) {
  return knex("project_posts")
    .where({ id: projectId, alumni_id: alumniProfileId })
    .first();
}

// ================== ALUMNI SIDE: PROJECT MANAGEMENT ==================

// 1. Post a new project
exports.postProject = async (req, res) => {
  try {
    const alumniProfileId = getAlumniProfileId(req);

    const {
      project_title,
      project_description,
      stipend,
      skills_required,
      duration,
      max_applicants_allowed,
      status,
    } = req.body;

    if (!project_title || !project_description) {
      return res.status(400).json({
        message: "project_title and project_description are required.",
      });
    }

    const [newProject] = await knex("project_posts")
      .insert({
        alumni_id: alumniProfileId,
        project_title,
        project_description,
        stipend,
        skills_required,
        duration,
        max_applicants_allowed,
        status: status || "active",
      })
      .returning("*");

    return res.status(201).json({
      message: "Project posted successfully.",
      project: newProject,
    });
  } catch (error) {
    console.error("Error in postProject:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 2. Get projects posted by logged-in alumni
exports.getMyProjects = async (req, res) => {
  try {
    const alumniProfileId = getAlumniProfileId(req);
    const { status, search, page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;
    const offset = (pageNumber - 1) * pageSize;

    const baseQuery = knex("project_posts").where("alumni_id", alumniProfileId);

    if (status) {
      baseQuery.andWhere("status", status);
    }

    if (search) {
      baseQuery.andWhere((qb) => {
        qb.whereILike("project_title", `%${search}%`)
          .orWhereILike("skills_required", `%${search}%`)
          .orWhereILike("duration", `%${search}%`);
      });
    }

    const projectsQuery = baseQuery
      .clone()
      .orderBy("created_at", "desc")
      .limit(pageSize)
      .offset(offset);

    const countQuery = baseQuery.clone().count("* as total");

    const [projects, countResult] = await Promise.all([
      projectsQuery,
      countQuery,
    ]);

    const total = Number(countResult[0]?.total || 0);

    return res.status(200).json({
      projects,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error in getMyProjects:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 3. Get single project (owned by alumni)
exports.getMyProjectById = async (req, res) => {
  try {
    const alumniProfileId = getAlumniProfileId(req);
    const { projectId } = req.params;

    const project = await findOwnedProject(projectId, alumniProfileId);
    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found or not owned by you." });
    }

    return res.status(200).json({ project });
  } catch (error) {
    console.error("Error in getMyProjectById:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 4. Update project (full + partial)
exports.updateProject = async (req, res) => {
  try {
    const alumniProfileId = getAlumniProfileId(req);
    const { projectId } = req.params;

    const project = await findOwnedProject(projectId, alumniProfileId);
    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found or not owned by you." });
    }

    const allowedFields = [
      "project_title",
      "project_description",
      "stipend",
      "skills_required",
      "duration",
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

    const [updatedProject] = await knex("project_posts")
      .where({ id: projectId, alumni_id: alumniProfileId })
      .update(updateData)
      .returning("*");

    return res.status(200).json({
      message: "Project updated successfully.",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error in updateProject:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 5. Delete project
exports.deleteProject = async (req, res) => {
  try {
    const alumniProfileId = getAlumniProfileId(req);
    const { projectId } = req.params;

    const project = await findOwnedProject(projectId, alumniProfileId);
    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found or not owned by you." });
    }

    await knex("project_posts")
      .where({ id: projectId, alumni_id: alumniProfileId })
      .del();

    return res.status(200).json({ message: "Project deleted successfully." });
  } catch (error) {
    console.error("Error in deleteProject:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 6. Repost / duplicate project
exports.repostProject = async (req, res) => {
  try {
    const alumniProfileId = getAlumniProfileId(req);
    const { projectId } = req.params;

    const existingProject = await findOwnedProject(projectId, alumniProfileId);
    if (!existingProject) {
      return res
        .status(404)
        .json({ message: "Project not found or not owned by you." });
    }

    const { status, ...restBody } = req.body || {};

    const projectToCopy = { ...existingProject };
    delete projectToCopy.id;
    delete projectToCopy.created_at;
    delete projectToCopy.updated_at;

    const insertData = {
      ...projectToCopy,
      ...restBody,
      status: status || "active",
      alumni_id: alumniProfileId,
    };

    const [newProject] = await knex("project_posts")
      .insert(insertData)
      .returning("*");

    return res.status(201).json({
      message: "Project reposted successfully.",
      project: newProject,
    });
  } catch (error) {
    console.error("Error in repostProject:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ================== STUDENT SIDE: PROJECT BROWSING ==================

// 7. Get all active projects (for students)
exports.getAllActiveProjects = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;
    const offset = (pageNumber - 1) * pageSize;

    const baseQuery = knex("project_posts as p")
      .leftJoin("alumni_profiles as ap", "p.alumni_id", "ap.id")
      .where("p.status", "active");

    if (search) {
      baseQuery.andWhere((qb) => {
        qb.whereILike("p.project_title", `%${search}%`)
          .orWhereILike("p.skills_required", `%${search}%`)
          .orWhereILike("p.duration", `%${search}%`)
          .orWhereILike("ap.name", `%${search}%`);
      });
    }

    const projectsQuery = baseQuery
      .clone()
      .select("p.*", "ap.name as posted_by_alumni_name")
      .orderBy("p.created_at", "desc")
      .limit(pageSize)
      .offset(offset);

    const countQuery = baseQuery.clone().count("p.id as total");

    const [projects, countResult] = await Promise.all([
      projectsQuery,
      countQuery,
    ]);

    const total = Number(countResult[0]?.total || 0);

    return res.status(200).json({
      projects,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error in getAllActiveProjects:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 8. Get single project details (for students + already_applied flag)
exports.getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = getUserId(req);

    const project = await knex("project_posts as p")
      .leftJoin("alumni_profiles as ap", "p.alumni_id", "ap.id")
      .where("p.id", projectId)
      .select("p.*", "ap.name as posted_by_alumni_name")
      .first();

    if (!project || project.status !== "active") {
      return res
        .status(404)
        .json({ message: "Project not found or not active." });
    }

    const existingApplication = await knex("project_applications")
      .where({ project_id: projectId, user_id: userId })
      .first();

    return res.status(200).json({
      project,
      already_applied: !!existingApplication,
      application_status: existingApplication?.status || null,
    });
  } catch (error) {
    console.error("Error in getProjectDetails:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
