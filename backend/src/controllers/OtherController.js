// src/controllers/otherPostController.js
const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const { sendEmail } = require("../services/emailService");

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

// ensure that current user (alumni) owns this other_post
const ensureOtherPostOwnedByAlumniUser = async (otherPostId, userId) => {
  const alumniProfile = await getAlumniProfileByUserId(userId);
  if (!alumniProfile) return null;

  const otherPost = await db("other_posts")
    .where({ id: otherPostId, alumni_id: alumniProfile.id })
    .first();

  return otherPost || null;
};

// ---------------------- ALUMNI SIDE ----------------------

// 1. postOtherPost
exports.postOtherPost = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || req.user.role !== "alumni") {
      return res
        .status(403)
        .json({ error: "Only alumni can create other posts." });
    }

    const alumniProfile = await getAlumniProfileByUserId(userId);
    if (!alumniProfile) {
      return res.status(400).json({
        error: "Alumni profile not found. Complete profile first.",
      });
    }

    const {
      heading,
      description,
      stipend,
      duration,
      max_applicants_allowed,
    } = req.body;

    if (!heading || !description) {
      return res.status(400).json({
        error: "heading and description are required.",
      });
    }

    const [otherPost] = await db("other_posts")
      .insert(
        {
          alumni_id: alumniProfile.id,
          heading,
          description,
          stipend: stipend || null,
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
      message: "Other post created successfully.",
      otherPost,
    });
  } catch (err) {
    console.error("postOtherPost error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 2. getMyOtherPosts (alumni)
exports.getMyOtherPosts = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || req.user.role !== "alumni") {
      return res
        .status(403)
        .json({ error: "Only alumni can view their other posts." });
    }

    const alumniProfile = await getAlumniProfileByUserId(userId);
    if (!alumniProfile) {
      return res.status(400).json({
        error: "Alumni profile not found. Complete profile first.",
      });
    }

    const posts = await db("other_posts")
      .where({ alumni_id: alumniProfile.id })
      .orderBy("created_at", "desc");

    return res.json({ posts });
  } catch (err) {
    console.error("getMyOtherPosts error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 3. getOtherPostById (alumni – only own post)
exports.getOtherPostById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({ error: "Only alumni can view this." });
    }

    const otherPost = await ensureOtherPostOwnedByAlumniUser(id, userId);
    if (!otherPost) {
      return res.status(404).json({
        error: "Other post not found or not owned by you.",
      });
    }

    return res.json({ otherPost });
  } catch (err) {
    console.error("getOtherPostById error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 4. updateOtherPost
exports.updateOtherPost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res
        .status(403)
        .json({ error: "Only alumni can update other posts." });
    }

    const otherPost = await ensureOtherPostOwnedByAlumniUser(id, userId);
    if (!otherPost) {
      return res.status(404).json({
        error: "Other post not found or not owned by you.",
      });
    }

    const updateData = { ...req.body, updated_at: db.fn.now() };

    delete updateData.id;
    delete updateData.alumni_id;

    await db("other_posts").where({ id }).update(updateData);

    const updated = await db("other_posts").where({ id }).first();
    return res.json({
      message: "Other post updated successfully.",
      otherPost: updated,
    });
  } catch (err) {
    console.error("updateOtherPost error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 5. deleteOtherPost
exports.deleteOtherPost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res
        .status(403)
        .json({ error: "Only alumni can delete other posts." });
    }

    const otherPost = await ensureOtherPostOwnedByAlumniUser(id, userId);
    if (!otherPost) {
      return res.status(404).json({
        error: "Other post not found or not owned by you.",
      });
    }

    await db("other_posts").where({ id }).del();
    return res.json({ message: "Other post deleted successfully." });
  } catch (err) {
    console.error("deleteOtherPost error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 6. repostOtherPost
exports.repostOtherPost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { max_applicants_allowed } = req.body;

    if (!userId || req.user.role !== "alumni") {
      return res
        .status(403)
        .json({ error: "Only alumni can repost other posts." });
    }

    const otherPost = await ensureOtherPostOwnedByAlumniUser(id, userId);
    if (!otherPost) {
      return res.status(404).json({
        error: "Other post not found or not owned by you.",
      });
    }

    const updateObj = {
      status: "active",
      updated_at: db.fn.now(),
    };

    if (max_applicants_allowed && Number(max_applicants_allowed) > 0) {
      updateObj.max_applicants_allowed = Number(max_applicants_allowed);
    }

    await db("other_posts").where({ id }).update(updateObj);

    const updated = await db("other_posts").where({ id }).first();
    return res.json({ message: "Other post reposted.", otherPost: updated });
  } catch (err) {
    console.error("repostOtherPost error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 7. getOtherPostApplicationsCount
exports.getOtherPostApplicationsCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { otherPostId } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({
        error: "Only alumni can view application counts.",
      });
    }

    const otherPost = await ensureOtherPostOwnedByAlumniUser(
      otherPostId,
      userId
    );
    if (!otherPost) {
      return res.status(404).json({
        error: "Other post not found or not owned by you.",
      });
    }

    const row = await db("other_post_applications")
      .where({ other_post_id: otherPostId })
      .count("* as count")
      .first();

    return res.json({
      otherPostId,
      totalApplications: Number(row?.count || 0),
    });
  } catch (err) {
    console.error("getOtherPostApplicationsCount error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 8. getOtherPostUnreadApplicationsCount
exports.getOtherPostUnreadApplicationsCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { otherPostId } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({
        error: "Only alumni can view unread application counts.",
      });
    }

    const otherPost = await ensureOtherPostOwnedByAlumniUser(
      otherPostId,
      userId
    );
    if (!otherPost) {
      return res.status(404).json({
        error: "Other post not found or not owned by you.",
      });
    }

    const row = await db("other_post_applications")
      .where({ other_post_id: otherPostId, is_read: false })
      .count("* as count")
      .first();

    return res.json({
      otherPostId,
      unreadApplications: Number(row?.count || 0),
    });
  } catch (err) {
    console.error("getOtherPostUnreadApplicationsCount error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 9. viewOtherPostApplicants
exports.viewOtherPostApplicants = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { otherPostId } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res
        .status(403)
        .json({ error: "Only alumni can view applicants." });
    }

    const otherPost = await ensureOtherPostOwnedByAlumniUser(
      otherPostId,
      userId
    );
    if (!otherPost) {
      return res.status(404).json({
        error: "Other post not found or not owned by you.",
      });
    }

    const applicants = await db("other_post_applications as opa")
      .join("users as u", "opa.user_id", "u.id")
      .leftJoin("student_profiles as sp", "sp.user_id", "u.id")
      .select(
        "opa.id as application_id",
        "opa.status as application_status",
        "opa.is_read",
        "opa.resume_url",
        "opa.applied_at",
        "u.id as user_id",
        "u.email as user_email",
        "sp.name as student_name",
        "sp.branch as student_branch",
        "sp.grad_year as student_grad_year"
      )
      .where("opa.other_post_id", otherPostId)
      .orderBy("opa.applied_at", "desc");

    return res.json({ otherPostId, applicants });
  } catch (err) {
    console.error("viewOtherPostApplicants error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 10. markOtherPostApplicationRead
exports.markOtherPostApplicationRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { applicationId } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({
        error: "Only alumni can mark applications as read.",
      });
    }

    const application = await db("other_post_applications")
      .where({ id: applicationId })
      .first();

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    const otherPost = await ensureOtherPostOwnedByAlumniUser(
      application.other_post_id,
      userId
    );
    if (!otherPost) {
      return res.status(403).json({
        error: "You are not authorized to modify this post.",
      });
    }

    await db("other_post_applications")
      .where({ id: applicationId })
      .update({ is_read: true });

    return res.json({ message: "Application marked as read." });
  } catch (err) {
    console.error("markOtherPostApplicationRead error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 11–13. accept / reject / hold other post application
const updateOtherPostApplicationStatus = async (req, res, newStatus) => {
  try {
    const userId = req.user?.id;
    const { applicationId } = req.params;

    if (!userId || req.user.role !== "alumni") {
      return res.status(403).json({
        error: "Only alumni can change application status.",
      });
    }

    const application = await db("other_post_applications")
      .where({ id: applicationId })
      .first();

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    const otherPost = await ensureOtherPostOwnedByAlumniUser(
      application.other_post_id,
      userId
    );
    if (!otherPost) {
      return res.status(403).json({
        error: "You are not authorized to modify this post.",
      });
    }

    await db("other_post_applications")
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
        const postTitle = otherPost.heading || "the post";
        const friendlyStatus = newStatus.replace("_", " ");

        await sendEmail({
          to: studentUser.email,
          subject: `Your application for ${postTitle} was ${friendlyStatus}`,
          text: `Hi ${studentName},

Your application for "${postTitle}" has been ${friendlyStatus} by the alumni reviewer.

Status: ${friendlyStatus}

If you have questions, you can reply to this email.

Thanks,
SGSITS Alumni Portal`,
        });
      }
    } catch (emailErr) {
      console.warn(
        "Other post status email notification failed:",
        emailErr && emailErr.message
      );
    }

    return res.json({
      message: `Application marked as ${newStatus}.`,
    });
  } catch (err) {
    console.error("updateOtherPostApplicationStatus error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.acceptOtherPostApplication = (req, res) =>
  updateOtherPostApplicationStatus(req, res, "accepted");

exports.rejectOtherPostApplication = (req, res) =>
  updateOtherPostApplicationStatus(req, res, "rejected");

exports.holdOtherPostApplication = (req, res) =>
  updateOtherPostApplicationStatus(req, res, "on_hold");
// ---------------------- STUDENT SIDE ----------------------

// 14. getAllOtherPostsStudent
exports.getAllOtherPostsStudent = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const baseQuery = db("other_posts")
      .where("status", "active")
      .select(
        "id",
        "title",
        "description",
        "location",
        "post_type",
        "created_at",
        "updated_at",
        "application_deadline",
        "max_applicants_allowed",
        "status"
      );

    const [posts, [{ total }]] = await Promise.all([
      baseQuery.clone().orderBy("created_at", "desc").limit(limit).offset(offset),
      baseQuery.clone().clearSelect().count({ total: "*" }),
    ]);

    return res.json({
      posts,
      page,
      limit,
      total: Number(total),
    });
  } catch (err) {
    console.error("getAllOtherPostsStudent error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 15. getOtherPostByIdStudent
exports.getOtherPostByIdStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await db("other_posts").where({ id }).first();

    if (!post) {
      return res.status(404).json({ error: "Other post not found." });
    }

    return res.json({ post });
  } catch (err) {
    console.error("getOtherPostByIdStudent error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 16. applyOtherPost (with Cloudinary resume upload)
exports.applyOtherPost = async (req, res) => {
  const userId = req.user?.id;
  const { other_post_id } = req.body;

  if (!userId || req.user.role !== "student") {
    return res
      .status(403)
      .json({ error: "Only students can apply to other posts." });
  }

  if (!other_post_id) {
    return res.status(400).json({ error: "other_post_id is required." });
  }

  try {
    // 1) Fetch other post
    const otherPost = await db("other_posts")
      .where({ id: other_post_id })
      .first();
    if (!otherPost) {
      return res.status(404).json({ error: "Other post not found." });
    }

    // 2) Check status
    if (otherPost.status !== "active") {
      return res.status(400).json({
        error: `This post is currently ${otherPost.status} and cannot accept new applications.`,
      });
    }

    // 3) Current applications count
    const countRow = await db("other_post_applications")
      .where({ other_post_id })
      .count("id as count")
      .first();
    const currentCount = Number(countRow?.count || 0);

    if (currentCount >= otherPost.max_applicants_allowed) {
      return res.status(400).json({
        error: "Application limit reached for this post.",
      });
    }

    // 4) Duplicate application check
    const existing = await db("other_post_applications")
      .where({ other_post_id, user_id: userId })
      .first();
    if (existing) {
      return res
        .status(400)
        .json({ error: "You have already applied to this post." });
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
    let limitReachedNow = false;
    const application = await db.transaction(async (trx) => {
      const [app] = await trx("other_post_applications")
        .insert(
          {
            other_post_id,
            user_id: userId,
            resume_url: resumeUrl,
            status: "pending",
            is_read: false,
          },
          [
            "id",
            "other_post_id",
            "user_id",
            "resume_url",
            "status",
            "applied_at",
          ]
        )
        .catch((err) => {
          if (err.code === "23505") {
            throw new Error("You have already applied to this post.");
          }
          throw err;
        });

      const newCountRow = await trx("other_post_applications")
        .where({ other_post_id })
        .count("id as count")
        .first();
      const newCount = Number(newCountRow?.count || 0);

      if (newCount >= otherPost.max_applicants_allowed) {
        limitReachedNow = true;
        await trx("other_posts")
          .where({ id: other_post_id })
          .update({ status: "paused", updated_at: trx.fn.now() });
      }

      return app;
    });

    if (limitReachedNow) {
      try {
        const owner = await db("alumni_profiles as ap")
          .join("users as u", "u.id", "ap.user_id")
          .where("ap.id", otherPost.alumni_id)
          .select("u.email", "ap.name")
          .first();

        if (owner?.email) {
          const title = otherPost.heading || "your post";
          await sendEmail({
            to: owner.email,
            subject: `Max applicant limit reached for ${title}`,
            text: `Hello ${owner.name || "Alumni"},

The maximum applicant limit for "${title}" has been reached.
The post has been auto-paused for new applications.

Regards,
SGSITS Alumni Portal`,
          });
        }
      } catch (emailErr) {
        console.warn(
          "Other post max-limit email notification failed:",
          emailErr && emailErr.message
        );
      }
    }

    return res.status(201).json({
      message: "Application to this post submitted successfully.",
      application,
    });
  } catch (err) {
    console.error("applyOtherPost error:", err);
    if (err.message === "You have already applied to this post.") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Server error" });
  }
};

// 17. withdrawOtherPostApplication
exports.withdrawOtherPostApplication = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { applicationId } = req.params;

    if (!userId || req.user.role !== "student") {
      return res.status(403).json({
        error: "Only students can withdraw applications.",
      });
    }

    const application = await db("other_post_applications")
      .where({ id: applicationId, user_id: userId })
      .first();

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    await db("other_post_applications").where({ id: applicationId }).del();

    return res.json({ message: "Application withdrawn successfully." });
  } catch (err) {
    console.error("withdrawOtherPostApplication error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 18. getAppliedOtherPosts
exports.getAppliedOtherPosts = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId || req.user.role !== "student") {
      return res.status(403).json({
        error: "Only students can view their applied posts.",
      });
    }

    const rows = await db("other_post_applications as opa")
      .join("other_posts as op", "opa.other_post_id", "op.id")
      .leftJoin("alumni_profiles as a", "op.alumni_id", "a.id")
      .select(
        "opa.id as application_id",
        "opa.status as application_status",
        "opa.applied_at",
        "opa.resume_url",
        "op.id as other_post_id",
        "op.heading",
        "op.duration",
        "op.status as post_status",
        "a.name as alumni_name",
        "a.grad_year as alumni_grad_year"
      )
      .where("opa.user_id", userId)
      .orderBy("opa.applied_at", "desc");

    return res.json({ applications: rows });
  } catch (err) {
    console.error("getAppliedOtherPosts error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 19. checkOtherPostApplicationStatus
exports.checkOtherPostApplicationStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { otherPostId } = req.params;

    if (!userId || req.user.role !== "student") {
      return res.status(403).json({
        error: "Only students can check application status.",
      });
    }

    const app = await db("other_post_applications")
      .where({ other_post_id: otherPostId, user_id: userId })
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
    console.error("checkOtherPostApplicationStatus error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
