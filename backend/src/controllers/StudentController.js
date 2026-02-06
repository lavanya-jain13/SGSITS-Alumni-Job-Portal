const db = require("../config/db");
const cloudinary = require("../config/cloudinary");

// helper: support both { userId } and { id } in JWT
const getUserIdFromReq = (req) => req?.user?.userId || req?.user?.id;

const getStudentProfileByUserId = async (userId) => {
  return db("student_profiles").where({ user_id: userId }).first();
};

// ---------------- SKILLS HELPERS ----------------
const normalizeSkills = (skills) => {
  if (skills == null) return null;

  const toEntry = (s) => {
    if (!s) return null;
    if (typeof s === "string") return s.trim();

    if (typeof s === "object") {
      const name = s.name || s.skill || s.title || "";
      if (!name) return null;

      const proficiency =
        s.proficiency !== undefined ? Number(s.proficiency) : undefined;
      const experience =
        s.experience !== undefined ? Number(s.experience) : undefined;

      return JSON.stringify({
        name,
        ...(Number.isFinite(proficiency) ? { proficiency } : {}),
        ...(Number.isFinite(experience) ? { experience } : {}),
      });
    }
    return null;
  };

  if (Array.isArray(skills)) return skills.map(toEntry).filter(Boolean);

  try {
    const parsed = JSON.parse(skills);
    if (Array.isArray(parsed)) return parsed.map(toEntry).filter(Boolean);
  } catch {}

  return String(skills)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const parseSkills = (skills) => {
  if (!skills) return [];

  const toObj = (s) => {
    if (!s) return null;

    if (typeof s === "object" && s.name) {
      return {
        name: s.name,
        proficiency: Number(s.proficiency) || 3,
        experience: Number(s.experience) || 1,
      };
    }

    if (typeof s === "string") {
      try {
        const parsed = JSON.parse(s);
        if (parsed?.name) {
          return {
            name: parsed.name,
            proficiency: Number(parsed.proficiency) || 3,
            experience: Number(parsed.experience) || 1,
          };
        }
      } catch {}

      return { name: s.trim(), proficiency: 3, experience: 1 };
    }
    return null;
  };

  return (Array.isArray(skills) ? skills : String(skills).split(","))
    .map((s) => s.trim())
    .map(toObj)
    .filter(Boolean);
};

const normalizeList = (v) =>
  v == null ? null : Array.isArray(v) ? v.join(", ") : String(v);

const parseList = (v) =>
  !v ? [] : Array.isArray(v) ? v : String(v).split(",").map((s) => s.trim());

// ---------------- GET PROFILE ----------------
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
        .orderBy("created_at", "desc");

      profile.skills = parseSkills(profile.skills);
      profile.desired_roles = parseList(profile.desired_roles);
      profile.preferred_locations = parseList(profile.preferred_locations);
      profile.experiences = experiences || [];

      profile.resumes = await db("student_resumes")
        .where({ student_id: profile.id })
        .orderBy("version", "desc");
    }

    res.json({ exists: !!profile, profile });
  } catch (err) {
    console.error("Get Student Profile Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ---------------- CREATE / UPDATE PROFILE ----------------
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
      address,
      desiredRoles,
      preferredLocations,
      workMode,
      dataConsent,
      contactPermissions,
      profileVisibility,
      codeOfConduct,
    } = req.body || {};

    if (typeof experiences === "string") {
      try {
        experiences = JSON.parse(experiences);
      } catch {
        experiences = [];
      }
    }

    skills = normalizeSkills(skills);

    let finalResumeUrl = resumeUrl || null;
    let pendingResumeUpload = null;

    // -------- RESUME UPLOAD --------
    if (req.file) {
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "student_resumes", resource_type: "raw" },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });

      pendingResumeUpload = uploaded;
      finalResumeUrl = uploaded.secure_url;
    }

    const existing = await getStudentProfileByUserId(userId);

    // ---------------- UPDATE FLOW ----------------
    if (existing) {
      // resume versioning
      if (pendingResumeUpload) {
        const last = await db("student_resumes")
          .where({ student_id: existing.id })
          .orderBy("version", "desc")
          .first();

        const nextVersion = last ? last.version + 1 : 1;

        await db("student_resumes")
          .where({ student_id: existing.id })
          .update({ is_active: false });

        await db("student_resumes").insert({
          student_id: existing.id,
          resume_url: pendingResumeUpload.secure_url,
          cloudinary_public_id: pendingResumeUpload.public_id,
          version: nextVersion,
          is_active: true,
        });

        const old = await db("student_resumes")
          .where({ student_id: existing.id })
          .andWhere("version", "<", nextVersion - 2);

        for (const r of old) {
          await cloudinary.uploader.destroy(r.cloudinary_public_id, {
            resource_type: "raw",
          });
        }

        await db("student_resumes")
          .whereIn("id", old.map((r) => r.id))
          .del();
      }

      await db("student_profiles")
        .where({ user_id: userId })
        .update({
          ...(name && { name }),
          ...(studentId && { student_id: studentId }),
          ...(branch && { branch }),
          ...(gradYear && { grad_year: Number(gradYear) }),
          ...(skills && { skills }),
          ...(finalResumeUrl && { resume_url: finalResumeUrl }),
          phone_number: phone || null,
          dob: dateOfBirth || null,
          current_year: currentYear || null,
          cgpa: cgpa || null,
          achievements: achievements || null,
          proficiency: summary || null,
          years_of_experience: Number(yearsOfExperience) || 0,
          address: address || null,
          desired_roles: normalizeList(desiredRoles),
          preferred_locations: normalizeList(preferredLocations),
          work_mode: workMode || null,
          consent_data_sharing: !!dataConsent,
          consent_marketing: !!contactPermissions,
          consent_profile_visibility: !!profileVisibility,
          consent_terms: !!codeOfConduct,
        });

      // experiences (FULLY RESTORED)
      if (Array.isArray(experiences)) {
        await db("student_experience")
          .where({ student_id: existing.id })
          .del();

        const rows = experiences
          .filter((e) => e && (e.position || e.title || e.company))
          .map((e) => ({
            student_id: existing.id,
            position: e.position || e.title || "",
            company: e.company || "",
            duration: e.duration || "",
            description: e.description || "",
            link: e.link || "",
          }));

        if (rows.length) await db("student_experience").insert(rows);
      }

      const updated = await getStudentProfileByUserId(userId);
      const updatedExperiences = await db("student_experience")
        .where({ student_id: updated.id })
        .orderBy("created_at", "desc");

      return res.json({
        message: "Profile updated successfully",
        profile: {
          ...updated,
          skills: parseSkills(updated.skills),
          experiences: updatedExperiences,
          desired_roles: parseList(updated.desired_roles),
          preferred_locations: parseList(updated.preferred_locations),
        },
      });
    }

    // ---------------- CREATE FLOW ----------------
    if (!name || !studentId || !branch || !gradYear) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["name", "studentId", "branch", "gradYear"],
      });
    }

    await db("student_profiles").insert({
      user_id: userId,
      name,
      student_id: studentId,
      branch,
      grad_year: Number(gradYear),
      skills,
      resume_url: finalResumeUrl,
      phone_number: phone || null,
      dob: dateOfBirth || null,
      current_year: currentYear || null,
      cgpa: cgpa || null,
      achievements: achievements || null,
      proficiency: summary || null,
      years_of_experience: Number(yearsOfExperience) || 0,
      address: address || null,
      desired_roles: normalizeList(desiredRoles),
      preferred_locations: normalizeList(preferredLocations),
      work_mode: workMode || null,
      consent_data_sharing: !!dataConsent,
      consent_marketing: !!contactPermissions,
      consent_profile_visibility: !!profileVisibility,
      consent_terms: !!codeOfConduct,
    });

    const created = await getStudentProfileByUserId(userId);

    if (pendingResumeUpload) {
      await db("student_resumes").insert({
        student_id: created.id,
        resume_url: pendingResumeUpload.secure_url,
        cloudinary_public_id: pendingResumeUpload.public_id,
        version: 1,
        is_active: true,
      });
    }

    if (Array.isArray(experiences)) {
      const rows = experiences.map((e) => ({
        student_id: created.id,
        position: e.position || e.title || "",
        company: e.company || "",
        duration: e.duration || "",
        description: e.description || "",
        link: e.link || "",
      }));
      if (rows.length) await db("student_experience").insert(rows);
    }

    res.status(201).json({ message: "Profile created successfully" });
  } catch (err) {
    console.error("Upsert Student Profile Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getMyProfile, upsertProfile };
