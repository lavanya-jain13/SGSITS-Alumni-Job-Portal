const db = require("../config/db");
const cloudinary = require("../config/cloudinary");

// helper: support both { userId } and { id } in JWT
const getUserIdFromReq = (req) => req?.user?.userId || req?.user?.id;

// normalize skills to text column (allow string or array)
const normalizeSkills = (skills) => {
  if (skills == null) return null;
  return Array.isArray(skills) ? skills.join(", ") : String(skills);
};

/**
 * GET /student/profile
 */
const getMyProfile = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const profile = await db("student_profiles")
      .where({ user_id: userId })
      .first();

    return res.status(200).json({
      exists: !!profile,
      profile: profile || null,
    });
  } catch (error) {
    console.error("Get Student Profile Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PUT /student/profile
 * Create/update student profile + upload resume
 */
const upsertProfile = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { name, studentId, branch, gradYear, skills, resumeUrl } =
      req.body || {};

    let finalResumeUrl = resumeUrl || null;

    // =========================================================
    //   RESUME UPLOAD (PDF / DOC / DOCX) VIA CLOUDINARY
    // =========================================================
    if (req.file) {
      console.log("Uploading resume to Cloudinary...");

      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "student_resumes",
            resource_type: "raw",
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );

        uploadStream.end(req.file.buffer);
      });

      try {
        const uploaded = await uploadPromise;
        finalResumeUrl = uploaded.secure_url;
      } catch (err) {
        console.error("Resume upload failed:", err);
        return res.status(500).json({ error: "Resume upload failed" });
      }
    }

    const existing = await db("student_profiles")
      .where({ user_id: userId })
      .first();

    // map camelCase -> snake_case
    const patch = {
      ...(name !== undefined && { name }),
      ...(studentId !== undefined && { student_id: studentId }),
      ...(branch !== undefined && { branch }),
      ...(gradYear !== undefined && { grad_year: Number(gradYear) }),
      ...(skills !== undefined && { skills: normalizeSkills(skills) }),
      ...(finalResumeUrl !== undefined && { resume_url: finalResumeUrl }),
    };

    // If profile EXISTS → update
    if (existing) {
      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: "No fields provided to update" });
      }

      await db("student_profiles").where({ user_id: userId }).update(patch);
      const updated = await db("student_profiles")
        .where({ user_id: userId })
        .first();

      return res.status(200).json({
        message: "Profile updated successfully",
        profile: updated,
      });
    }

    // If profile DOES NOT EXIST → CREATE new
    const missing = [];
    if (!name) missing.push("name");
    if (!studentId) missing.push("studentId");
    if (!branch) missing.push("branch");
    if (
      gradYear === undefined ||
      gradYear === null ||
      Number.isNaN(Number(gradYear))
    )
      missing.push("gradYear");

    if (missing.length) {
      return res.status(400).json({
        error: "Missing required fields for first-time profile creation",
        required: ["name", "studentId", "branch", "gradYear"],
        missing,
      });
    }

    const insertRow = {
      user_id: userId,
      name,
      student_id: studentId,
      branch,
      grad_year: Number(gradYear),
      skills: normalizeSkills(skills) || null,
      resume_url: finalResumeUrl || null,
    };

    await db("student_profiles").insert(insertRow);
    const created = await db("student_profiles")
      .where({ user_id: userId })
      .first();

    return res.status(201).json({
      message: "Profile created successfully",
      profile: created,
    });
  } catch (error) {
    console.error("Upsert Student Profile Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getMyProfile, upsertProfile };
