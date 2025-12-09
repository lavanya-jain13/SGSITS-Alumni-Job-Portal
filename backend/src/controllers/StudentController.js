const db = require("../config/db");
const cloudinary = require("../config/cloudinary");

// helper: support both { userId } and { id } in JWT
const getUserIdFromReq = (req) => req?.user?.userId || req?.user?.id;

// normalize skills to store in text[] (accept array or string)
const normalizeSkills = (skills) => {
  if (skills == null) return null;
  if (Array.isArray(skills)) return skills;

  // try parsing JSON array string
  try {
    const parsed = JSON.parse(skills);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // ignore
  }

  // fallback: comma-separated string -> array of trimmed
  return String(skills)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

// parse DB skills to array for the frontend
const parseSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  return String(skills)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

/**
 * GET /student/profile
 */
const getMyProfile = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const profile = await db("student_profiles as sp")
      .leftJoin("users as u", "sp.user_id", "u.id")
      .select("sp.*", "u.email")
      .where("sp.user_id", userId)
      .first();

    if (profile) {
      const experiences = await db("student_experience")
        .where({ student_id: profile.id })
        .select("id", "position", "company", "duration", "description")
        .orderBy("created_at", "desc");

      profile.skills = parseSkills(profile.skills);
      profile.experiences = experiences || [];
    }

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

    let {
      name,
      studentId,
      branch,
      gradYear,
      skills,
      resumeUrl,
      experiences,
      phone,
      dateOfBirth,
      currentYear,
      cgpa,
      achievements,
      summary,
      yearsOfExperience,
    } = req.body || {};

    // convert experiences string -> JSON if needed
    if (typeof experiences === "string") {
      try {
        experiences = JSON.parse(experiences);
      } catch (e) {
        experiences = [];
      }
    }

    // ensure skills are normalized to array or null
    skills = normalizeSkills(skills);

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
      ...(phone !== undefined && { phone_number: phone }),
      ...(dateOfBirth !== undefined && { dob: dateOfBirth }),
      ...(currentYear !== undefined && { current_year: currentYear }),
      ...(cgpa !== undefined && { cgpa }),
      ...(achievements !== undefined && { achievements }),
      ...(summary !== undefined && { proficiency: summary }),
      ...(yearsOfExperience !== undefined && {
        years_of_experience: Number(yearsOfExperience),
      }),
    };

    // If profile EXISTS → update
    if (existing) {
      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: "No fields provided to update" });
      }

      await db("student_profiles").where({ user_id: userId }).update(patch);

      // replace experiences if provided
      if (Array.isArray(experiences)) {
        await db("student_experience").where({ student_id: existing.id }).del();
        const rows = experiences
          .filter((exp) => exp && (exp.position || exp.title || exp.company))
          .map((exp) => ({
            student_id: existing.id,
            position: exp.position || exp.title || "",
            company: exp.company || "",
            duration: exp.duration || "",
            description:
              exp.description || (exp.link ? `Link: ${exp.link}` : "") || "",
          }));
        if (rows.length) await db("student_experience").insert(rows);
      }

      const updated = await db("student_profiles")
        .where({ user_id: userId })
        .first();
      const updatedExperiences = await db("student_experience")
        .where({ student_id: updated.id })
        .select("id", "position", "company", "duration", "description")
        .orderBy("created_at", "desc");

      return res.status(200).json({
        message: "Profile updated successfully",
        profile: {
          ...updated,
          skills: parseSkills(updated.skills),
          experiences: updatedExperiences || [],
        },
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
      phone_number: phone || null,
      dob: dateOfBirth || null,
      current_year: currentYear || null,
      cgpa: cgpa || null,
      achievements: achievements || null,
      proficiency: summary || null,
      years_of_experience:
        yearsOfExperience !== undefined ? Number(yearsOfExperience) : null,
    };

    await db("student_profiles").insert(insertRow);
    const created = await db("student_profiles")
      .where({ user_id: userId })
      .first();

    // insert experiences if provided
    if (Array.isArray(experiences)) {
      const rows = experiences
        .filter((exp) => exp && (exp.position || exp.title || exp.company))
        .map((exp) => ({
          student_id: created.id,
          position: exp.position || exp.title || "",
          company: exp.company || "",
          duration: exp.duration || "",
          description:
            exp.description || (exp.link ? `Link: ${exp.link}` : "") || "",
        }));
      if (rows.length) await db("student_experience").insert(rows);
    }

    return res.status(201).json({
      message: "Profile created successfully",
      profile: {
        ...created,
        skills: parseSkills(created.skills),
        experiences: experiences || [],
      },
    });
  } catch (error) {
    console.error("Upsert Student Profile Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getMyProfile, upsertProfile };
