// src/controllers/jobController.js 
const db = require("../config/db"); 
const cloudinary = require("../config/cloudinary"); 
const { sendEmail } = require("../services/emailService"); 
// ---------- Helpers ---------- 
// Normalize branch strings for comparison (lowercase, trim, map common variants/abbreviations) 
const normalizeBranchForMatch = (value) => { 
  if (!value) return ""; 
  const base = String(value) 
    .toLowerCase() 
    .replace(/&/g, "and") 
    .replace(/[\.\-]/g, " ") 
    .replace(/[\[\]\(\)'"]/g, " ") // strip brackets/quotes from serialized arrays 
    .replace(/[^a-z0-9\s]/g, " ") // drop other punctuation 
    .replace(/\b(engg|engineering|eng)\b/g, "") // drop engineering suffixes 
    .replace(/\s+/g, " ") 
    .trim(); 
 
  const branchMap = [ 
    { regex: /(computer\s*science|cse|cs)/, normalized: "computer science" }, 
    { regex: /(information\s*technology|it)/, normalized: "information technology" }, 
    { 
      regex: /(electronics\s*(and)?\s*(telecommunication|communication)|entc|etc|ece)/, 
      normalized: "electronics and telecommunication", 
    }, 
    { 
      regex: /(electronics\s*(and)?\s*instrumentation|ei|eie)/, 
      normalized: "electronics and instrumentation", 
    }, 
    { regex: /(electrical|ee)/, normalized: "electrical" }, 
    { regex: /(mechanical|me)/, normalized: "mechanical" }, 
    { regex: /(civil|ce)/, normalized: "civil" }, 
    { 
      regex: /(industrial\s*(and)?\s*(production|engg)|ip)/, 
      normalized: "industrial production", 
    }, 
    { regex: /(biomedical)/, normalized: "biomedical engineering" }, 
  ]; 
 
  const match = branchMap.find((entry) => entry.regex.test(base)); 
  return match ? match.normalized : base; 
}; 
 
const toBranchList = (value) => { 
  if (!value) return []; 
  if (Array.isArray(value)) return value; 
  if (typeof value === "string") { 
    // Accept JSON stringified arrays 
    try { 
      const parsed = JSON.parse(value); 
      if (Array.isArray(parsed)) return parsed; 
    } catch (err) { 
      /* fall through */ 
    } 
    return value.split(/[,\\n;]+/); // fallback: split common separators 
  } 
  return []; 
}; 
 
const normalizeListText = (value) => { 
  if (value == null) return null; 
  if (Array.isArray(value)) return value.filter(Boolean).join(", "); 
  return String(value); 
}; 
 
const parseListText = (value) => { 
  if (!value) return []; 
  if (Array.isArray(value)) return value.filter(Boolean); 
  return String(value) 
    .split(",") 
    .map((s) => s.trim()) 
    .filter(Boolean); 
}; 
 
const parseProfileSkills = (skills) => { 
  if (!skills) return []; 
  const toObj = (s) => { 
    if (!s) return null; 
    if (typeof s === "object" && s.name) { 
      return { 
        name: s.name, 
        proficiency: Number.isFinite(s.proficiency) 
          ? Number(s.proficiency) 
          : 3, 
        experience: Number.isFinite(s.experience) 
          ? Number(s.experience) 
          : 1, 
      }; 
    } 
    if (typeof s === "string") { 
      const trimmed = s.trim(); 
      try { 
        const parsed = JSON.parse(trimmed); 
        if (parsed && typeof parsed === "object" && parsed.name) { 
          return { 
            name: parsed.name, 
            proficiency: Number.isFinite(parsed.proficiency) 
              ? Number(parsed.proficiency) 
              : 3, 
            experience: Number.isFinite(parsed.experience) 
              ? Number(parsed.experience) 
              : 1, 
          }; 
        } 
      } catch (_err) { 
        // not JSON, treat as plain name 
      } 
      if (trimmed) { 
        return { name: trimmed, proficiency: 3, experience: 1 }; 
      } 
    } 
    return null; 
  }; 
 
  const arr = Array.isArray(skills) 
    ? skills 
    : String(skills) 
        .split(",") 
        .map((s) => s.trim()) 
        .filter(Boolean); 
 
  return arr.map(toObj).filter(Boolean); 
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
  skills_required: normalizeListText( 
    body.skills_required || body.requiredSkills || body.required_skills 
  ), 
  stipend: body.stipend || null, 
  application_deadline: body.application_deadline || null, 
 
  max_applicants_allowed: 
    body.max_applicants_allowed && Number(body.max_applicants_allowed) > 0 
      ? Number(body.max_applicants_allowed) 
      : 50, 
 
  allowed_branches: normalizeListText(body.allowed_branches), 
  nice_to_have_skills: normalizeListText( 
    body.nice_to_have_skills || body.niceToHaveSkills 
  ), 
  work_mode: body.work_mode || body.workMode || null, 
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
 
    // Prefer company explicitly selected in the payload (if it belongs to this alumni) 
    const requestedCompanyId = req.body.company_id || req.body.companyId; 
    let company = null; 
    if (requestedCompanyId) { 
      company = await db("companies") 
        .where({ id: requestedCompanyId, alumni_id: alumniProfile.id }) 
        .first(); 
    } 
    // fallback: first company for this alumni 
    if (!company) { 
      company = await db("companies") 
        .where({ alumni_id: alumniProfile.id }) 
        .first(); 
    } 
 
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
      skills_required: normalizeListText( 
        updateData.skills_required || 
          updateData.requiredSkills || 
          updateData.required_skills 
      ), 
      nice_to_have_skills: normalizeListText( 
        updateData.nice_to_have_skills || updateData.niceToHaveSkills 
      ), 
      work_mode: updateData.work_mode || updateData.workMode || null, 
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
 
    // Reset applications when reposting so the new posting starts clean 
    await db.transaction(async (trx) => { 
      await trx("job_applications").where({ job_id: id }).del(); 
      await trx("jobs").where({ id }).update(updateObj); 
    }); 
 
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
        "sp.phone_number as student_phone", 
        "sp.achievements as student_achievements", 
        "sp.skills as student_skills", 
        "sp.address as student_location", 
        "sp.resume_url as profile_resume_url", 
        "j.skills_required as job_skills" 
      ) 
      .orderBy("ja.applied_at", "desc"); 
 
    return res.json({ jobId, applicants }); 
  } catch (err) { 
    console.error("viewJobApplicants error:", err); 
    return res.status(500).json({ error: "Server error" }); 
  } 
}; 
 
// 9b. Get full student profile for a job application (alumni only) 
exports.getJobApplicantProfile = async (req, res) => { 
  try { 
    const userId = req.user?.id; 
    const role = req.user?.role; 
    const { applicationId } = req.params; 
 
    if (!userId || (role !== "alumni" && role !== "admin")) { 
      return res 
        .status(403) 
        .json({ error: "Only alumni or admin can view applicant profiles." }); 
    } 
 
    const applicationQuery = db("job_applications as ja") 
      .join("jobs as j", "ja.job_id", "j.id") 
      .where("ja.id", applicationId); 
 
    if (role === "alumni") { 
      const alumniProfile = await getAlumniProfileByUserId(userId); 
      if (!alumniProfile) { 
        return res 
          .status(400) 
          .json({ error: "Alumni profile not found. Complete profile first." }); 
      } 
      applicationQuery.andWhere("j.alumni_id", alumniProfile.id); 
    } 
 
    const application = await applicationQuery 
      .select("ja.user_id as student_user_id") 
      .first(); 
 
    if (!application) { 
      return res.status(404).json({ error: "Application not found." }); 
    } 
 
    const profile = await db("student_profiles as sp") 
      .leftJoin("users as u", "sp.user_id", "u.id") 
      .select("sp.*", "u.email") 
      .where("sp.user_id", application.student_user_id) 
      .first(); 
 
    if (!profile) { 
      return res.status(404).json({ error: "Student profile not found." }); 
    } 
 
    if (profile.consent_profile_visibility === false) { 
      return res 
        .status(403) 
        .json({ error: "Student has disabled profile visibility." }); 
    } 
 
    const experiences = await db("student_experience") 
      .where({ student_id: profile.id }) 
      .select("id", "position", "company", "duration", "description") 
      .orderBy("created_at", "desc"); 
 
    profile.skills = parseProfileSkills(profile.skills); 
    profile.desired_roles = parseListText(profile.desired_roles); 
    profile.preferred_locations = parseListText(profile.preferred_locations); 
    profile.experiences = experiences || []; 
 
    return res.json({ applicationId, profile }); 
  } catch (err) { 
    console.error("getJobApplicantProfile error:", err); 
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
 
    // Send status-change email to the student (best-effort) 
    try { 
      const studentUser = await db("users") 
        .where({ id: application.user_id }) 
        .first(); 
      const studentProfile = await db("student_profiles") 
        .where({ user_id: application.user_id }) 
        .first(); 
 
      if (studentUser?.email) { 
        const studentName = 
          studentProfile?.name || studentUser.name || "there"; 
        const jobTitle = job.job_title || "the job"; 
        const friendlyStatus = newStatus.replace("_", " "); 
 
        await sendEmail({ 
          to: studentUser.email, 
          subject: `Your application for ${jobTitle} was ${friendlyStatus}`, 
          text: `Hi ${studentName}, 
 
Your application for "${jobTitle}" has been ${friendlyStatus} by the alumni reviewer. 
 
Status: ${friendlyStatus} 
 
If you have questions, you can reply to this email. 
 
Thanks, 
SGSITS Alumni Portal`, 
        }); 
      } 
    } catch (emailErr) { 
      console.warn("Email notification failed:", emailErr && emailErr.message); 
    } 
 
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
    const page = Math.max(Number(req.query.page) || 1, 1); 
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100); 
    const offset = (page - 1) * limit; 
 
    const baseQuery = db("jobs as j") 
  .leftJoin("companies as c", "j.company_id", "c.id") 
  .select( 
    "j.id", 
    "j.job_title", 
    "j.job_description", 
    "j.location", 
    "j.job_type", 
    "j.experience_required", 
    "j.application_deadline", 
    "j.created_at", 
    "j.updated_at", 
    "j.allowed_branches", 
    "j.stipend", 
    "j.salary_range", 
    "j.ctc_type", 
    "j.min_ctc", 
    "j.max_ctc", 
    "j.skills_required",        // ✅ add 
    "j.nice_to_have_skills",    // ✅ add (optional but recommended) 
    "j.work_mode",      
    "j.max_applicants_allowed", 
    "j.status", 
    "c.name as company_name", 
    "c.industry as company_industry", 
    "c.company_size", 
    "c.website as company_website" 
  ); 
 
 
    const [jobs, [{ total }]] = await Promise.all([ 
      baseQuery.clone().orderBy("j.created_at", "desc").limit(limit).offset(offset), 
      baseQuery.clone().clearSelect().count({ total: "*" }), 
    ]); 
 
    return res.json({ 
      jobs, 
      page, 
      limit, 
      total: Number(total), 
    }); 
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
      .leftJoin("job_applications as ja", "ja.job_id", "j.id") 
      .where("j.id", id) 
      .groupBy( 
        "j.id", 
        "c.name", 
        "c.website", 
        "c.industry", 
        "c.company_size", 
        "c.about" 
      ) 
      .select( 
        "j.*", 
        "c.name as company_name", 
        "c.website as company_website", 
        "c.industry as company_industry", 
        "c.company_size", 
        "c.about as company_about", 
        db.raw("COUNT(ja.id) as applicants_count") 
      ) 
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
 
    // 3) Check if student's branch is in allowed_branches 
    const studentProfile = await db("student_profiles") 
      .where({ user_id: userId }) 
      .first(); 
 
    if (!studentProfile) { 
      return res.status(400).json({ error: "Student profile not found." }); 
    } 
 
    // Normalize branch names for comparison (trim + lowercase + strip suffixes) 
    const studentBranch = normalizeBranchForMatch(studentProfile.branch); 
 
    // Normalize allowed_branches (convert to an array of strings) 
    const allowedBranchesRaw = toBranchList(job.allowed_branches); 
    const allowedBranches = allowedBranchesRaw 
      .map((branch) => normalizeBranchForMatch(branch)) 
      .filter(Boolean); 
 
    const branchAllowed = 
      allowedBranches.length === 0 || 
      allowedBranches.some( 
        (allowed) => 
          allowed === studentBranch || 
          studentBranch.includes(allowed) || 
          allowed.includes(studentBranch) 
      ); 
 
    if (!branchAllowed) { 
      console.warn("Branch check failed", { 
        studentBranchOriginal: studentProfile.branch, 
        studentBranchNormalized: studentBranch, 
        allowedBranchesRaw, 
        allowedBranchesNormalized: allowedBranches, 
      }); 
      return res.status(400).json({ 
        error: "Your branch is not allowed to apply for this job.", 
        details: { 
          student_branch: studentBranch, 
          allowed_branches: allowedBranches, 
        }, 
      }); 
    } 
 
    // 4) Current applications count 
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
 
    // 5) Check duplicate application 
    const existing = await db("job_applications") 
      .where({ job_id, user_id: userId }) 
      .first(); 
    if (existing) { 
      return res 
        .status(400) 
        .json({ error: "You have already applied to this job." }); 
    } 
 
    // 6) Handle resume upload 
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
 
    // 7) Do everything in a transaction 
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

// Public endpoint: Get all approved companies with active job counts
exports.getAllCompaniesPublic = async (req, res) => {
  try {
    // Get all approved companies
    const companies = await db("companies")
      .whereRaw("LOWER(status) = 'approved' OR status IS NULL")
      .select(
        "id",
        "name",
        "industry",
        "company_size",
        "website",
        "linkedin",
        "twitter",
        "office_location"
      )
      .orderBy("name", "asc");

    // Get active job counts for each company (case-insensitive)
    const jobCounts = await db("jobs")
      .whereRaw("LOWER(status) = 'active'")
      .select("company_id")
      .count("* as active_jobs")
      .groupBy("company_id");

    // Create a map of company_id -> active_jobs
    const jobCountMap = {};
    jobCounts.forEach((item) => {
      jobCountMap[item.company_id] = Number(item.active_jobs || 0);
    });

    // Merge job counts with companies
    const companiesWithJobs = companies.map((company) => ({
      ...company,
      activeJobs: jobCountMap[company.id] || 0,
    }));

    // Filter to only show companies with at least 1 active job, then sort by job count
    const filtered = companiesWithJobs
      .filter((c) => c.activeJobs > 0)
      .sort((a, b) => b.activeJobs - a.activeJobs);

    return res.json({ companies: filtered });
  } catch (err) {
    console.error("getAllCompaniesPublic error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Public endpoint: Get limited active jobs for landing page (no auth)
exports.getFeaturedJobsPublic = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 6; // Default to 6 jobs
    const jobs = await db("jobs as j")
      .leftJoin("companies as c", "j.company_id", "c.id")
      .whereRaw("LOWER(j.status) = 'active'")
      .select(
        "j.id",
        "j.job_title",
        "j.job_description",
        "j.job_type",
        "j.location",
        "j.allowed_branches",
        "j.experience_required",
        "j.stipend",
        "j.salary_range",
        "j.ctc_type",
        "j.min_ctc",
        "j.max_ctc",
        "j.skills_required",
        "j.work_mode",
        "c.name as company_name"
      )
      .orderBy("j.created_at", "desc")
      .limit(limit);

    // Map allowed_branches to array if stored as string
    const mappedJobs = jobs.map(job => ({
      ...job,
      allowed_branches: Array.isArray(job.allowed_branches)
        ? job.allowed_branches
        : String(job.allowed_branches || '').split(',').map(b => b.trim()).filter(Boolean),
      tags: Array.isArray(job.skills_required)
        ? job.skills_required
        : String(job.skills_required || '').split(',').map(s => s.trim()).filter(Boolean),
    }));

    return res.json({ jobs: mappedJobs });
  } catch (err) {
    console.error("getFeaturedJobsPublic error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Public endpoint: Get company by ID (for public viewing)
exports.getCompanyByIdPublic = async (req, res) => {
  try {
    const { id } = req.params;

    // Get approved company (no auth required)
    let company;
    try {
      company = await db("companies")
        .where({ id })
        .whereRaw("LOWER(status) = 'approved' OR status IS NULL")
        .select(
          "id",
          "name",
          "industry",
          "company_size",
          "website",
          "about",
          "linkedin",
          "twitter",
          "office_location",
          "company_culture",
          "created_at"
        )
        .first();
    } catch (err) {
      console.error("Get Company column mismatch, falling back:", err.message);
      company = await db("companies")
        .where({ id })
        .whereRaw("LOWER(status) = 'approved' OR status IS NULL")
        .select(
          "id",
          "name",
          "industry",
          "company_size",
          "website",
          "about",
          "status",
          "created_at",
          "linkedin_url",
          "twitter_url",
          "office_locations",
          db.raw("NULL as linkedin"),
          db.raw("NULL as twitter"),
          db.raw("NULL as office_location"),
          db.raw("NULL as company_culture")
        )
        .first();
    }

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Get active jobs count
    const [{ count: activeJobsRaw } = { count: 0 }] = await db("jobs")
      .where({ company_id: id })
      .andWhereRaw("LOWER(status) = 'active'")
      .count("* as count");

    const [{ count: alumniHiredRaw } = { count: 0 }] = await db("job_applications as ja")
      .join("jobs as j", "ja.job_id", "j.id")
      .where("j.company_id", id)
      .andWhereRaw("LOWER(ja.status) = 'accepted'")
      .count("* as count");

    // Helper to split office locations
    const splitOfficeLocations = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return String(val).split("|").map((s) => s.trim()).filter(Boolean);
    };

    const normalized = {
      ...company,
      office_locations: splitOfficeLocations(company.office_locations || company.office_location),
      company_culture: company.company_culture || null,
      linkedin_url: company.linkedin_url || company.linkedin || null,
      twitter_url: company.twitter_url || company.twitter || null,
      activeJobs: Number(activeJobsRaw || 0),
      alumniHired: Number(alumniHiredRaw || 0),
    };

    return res.json({ company: normalized });
  } catch (error) {
    console.error("Get Company Public Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Public endpoint: Get jobs posted by a specific company
exports.getCompanyJobsPublic = async (req, res) => {
  try {
    const { companyId } = req.params;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const offset = (page - 1) * limit;

    // Verify company exists and is approved
    const company = await db("companies")
      .where({ id: companyId })
      .whereRaw("LOWER(status) = 'approved' OR status IS NULL")
      .first();

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Get active jobs for this company
    const baseQuery = db("jobs as j")
      .leftJoin("companies as c", "j.company_id", "c.id")
      .where("j.company_id", companyId)
      .andWhereRaw("LOWER(j.status) = 'active'")
      .select(
        "j.id",
        "j.job_title",
        "j.job_description",
        "j.location",
        "j.job_type",
        "j.experience_required",
        "j.application_deadline",
        "j.created_at",
        "j.updated_at",
        "j.allowed_branches",
        "j.stipend",
        "j.salary_range",
        "j.ctc_type",
        "j.min_ctc",
        "j.max_ctc",
        "j.skills_required",
        "j.work_mode",
        "j.status",
        "c.name as company_name"
      );

    const [jobs, [{ total }]] = await Promise.all([
      baseQuery.clone().orderBy("j.created_at", "desc").limit(limit).offset(offset),
      baseQuery.clone().clearSelect().count({ total: "*" }),
    ]);

    return res.json({
      jobs,
      page,
      limit,
      total: Number(total),
    });
  } catch (error) {
    console.error("Get Company Jobs Public Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}; 
