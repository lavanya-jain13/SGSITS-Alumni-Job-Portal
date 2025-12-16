const db = require("../config/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../services/emailService");

const isStrongPassword = (pwd) => {
  if (typeof pwd !== "string") return false;
  const hasMinLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  return hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
};

// Use the same JWT secret as authMiddleware
const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret";

const buildCookieOptions = () => {
  const frontendUrl = process.env.FRONTEND_URL || "";
  const isLocalhost =
    frontendUrl.includes("localhost") || frontendUrl.includes("127.0.0.1");
  const isHttps = frontendUrl.startsWith("https://");
  const sameSite =
    process.env.COOKIE_SAMESITE || (isHttps ? "none" : "lax");
  const secure =
    process.env.COOKIE_SECURE === "true" || (isHttps && sameSite === "none");

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge: 60 * 60 * 1000, // 1 hour
  };
};

// ==================== REGISTER STUDENT ====================
const registerStudent = async (req, res) => {
  try {
    const { name, role, email, password_hash, branch, gradYear, student_id, otp } =
      req.body;

    const normalizedRole = (role || "student").toLowerCase();

    if (
      !name ||
      !email ||
      !password_hash ||
      !branch ||
      !gradYear ||
      !student_id ||
      !otp
    ) {
      return res.status(400).json({ error: "All fields (including OTP) are required" });
    }
    if (email.split("@")[1] !== "sgsits.ac.in") {
      return res.status(400).json({ error: "Email is not authorised" });
    }

    const validBranches = [
      "computer science",
      "information technology",
      "electronics and telecommunication",
      "electronics and instrumentation",
      "electrical",
      "mechanical",
      "civil",
      "industrial production",
    ];

    function isValidBranch(branch) {
      return validBranches.includes(branch.toLowerCase().trim());
    }

    if (!isValidBranch(branch)) {
      return res.status(400).json({ error: "Branch is incorrect" });
    }

    const existingUser = await db("users").where({ email }).first();
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    // Validate OTP before creating the account
    const otpEntry = await db("otp_verifications")
      .where({ email, otp })
      .andWhere("expires_at", ">", new Date())
      .first();

    if (!otpEntry) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    if (!isStrongPassword(password_hash)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      });
    }

    const hashedPassword = await bcrypt.hash(password_hash, 10);
    let createdUser = null;

    // ✅ Use transaction to ensure atomicity
    await db.transaction(async (trx) => {
      // Insert user and return its generated id (UUID)
      const [newUser] = await trx("users").insert(
        {
          email,
          password_hash: hashedPassword,
          role: normalizedRole,
          is_verified: true,
        },
        ["id", "role"] // important: this returns the id (Postgres syntax)
      );

      createdUser = {
        id: newUser.id,
        email,
        role: (newUser.role || normalizedRole).toLowerCase(),
      };

      // Insert into student_profiles with the fetched user_id
      await trx("student_profiles").insert({
        name,
        user_id: newUser.id, // fetched from the previous insert
        student_id,
        branch,
        grad_year: gradYear,
      });

      // consume OTP after successful creation
      await trx("otp_verifications").where({ email, otp }).del();
    });

    const token = jwt.sign(
      { id: createdUser.id, email, role: createdUser.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("access_token", token, buildCookieOptions());

    res.status(201).json({
      message: "User registered successfully",
      user: createdUser,
    });
  } catch (error) {
    console.error("Student Registration Error:", error);
    res.status(500).json({ error: "An error occurred during registration." });
  }
};

// // ==================== LOGIN ====================
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await db("users").where({ email }).first();
  if (!user)
    return res
      .status(400)
      .json({ message: "Your account not found please Signup to login" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: "Invalid password" });

  const roleToAssign = user.role.toLowerCase();
  const token = jwt.sign(
    { id: user.id, email: user.email, role: roleToAssign },
    SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );

  res.cookie("access_token", token, buildCookieOptions());

  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: roleToAssign,
    },
    message: "Login successful",
  });
};

// ==================== REGISTER ALUMNI ====================
const registerAlumni = async (req, res) => {
  const { name, grad_year, email, password_hash, current_title, otp } = req.body;

  if (!name || !email || !password_hash || !current_title || !grad_year || !otp) {
    return res.status(400).json({ error: "All fields (including OTP) are required" });
  }
  

  // ✅ Enforce business/company email
  const corporateDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "sgsits.ac.in",
    "mailnator.com",
    "tempmail.com",
    "10minutemail.com",
  ];

  function isBusinessEmail(email) {
    const domain = email.split("@")[1].toLowerCase();
    return !corporateDomains.includes(domain);
  }
  
  if (!isBusinessEmail(email)) {
    return res
      .status(400)
      .json({ error: "Please use a valid business/company email ID" });
  }else{
  }

  try {
    const existingAlumni = await db("users").where({ email }).first();
    if (existingAlumni) {
      return res.status(409).json({
        error:
          "An account with this email already exists or is pending verification.",
      });
    }

    // Validate OTP before creating the account
    const otpEntry = await db("otp_verifications")
      .where({ email, otp })
      .andWhere("expires_at", ">", new Date())
      .first();

    if (!otpEntry) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    if (!isStrongPassword(password_hash)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      });
    }

    const role = "alumni";
  
  const hashedPassword = await bcrypt.hash(password_hash, 10);
  let createdUser = null;
  await db.transaction(async (trx) => {
    const [newUser] = await trx("users").insert(
      {
        email,
        password_hash: hashedPassword,
        role,
        status: "pending",
        is_verified: true,
      },
      ["id"] // important: this returns the id (Postgres syntax)
    );

    createdUser = {
      id: newUser.id,
      email,
      role,
      status: "pending",
    };

      const [newAlumni] = await trx("alumni_profiles").insert(
        {
          name,
          user_id: newUser.id,
          grad_year,
          current_title,
          status: "pending", // will update after admin approval
        },
        ["id"]
      );

      await trx("companies").insert({
        alumni_id: newAlumni.id,
        user_id: newUser.id,
        status: "pending",
      });

      // consume OTP
      await trx("otp_verifications").where({ email, otp }).del();
    });

    const token = jwt.sign(
      { id: createdUser.id, email, role, status: createdUser.status },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("access_token", token, buildCookieOptions());

    res.status(201).json({
      message:
        "Registration submitted successfully. You will receive an email once your account has been verified by an administrator.",
      user: createdUser,
    });
  } catch (error) {
    console.error("Alumni Registration Error:", error);
    res.status(500).json({
      error: "An error occurred during registration. Please try again.",
    });
  }
};

// ==================== OTP GENERATION ====================
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // always 6 digits
};

// ==================== FORGOT PASSWORD: GENERATE OTP ====================
const forgotPasswordGenerateOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await db("users").where({ email }).first();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = generateOTP(); // a 6-digit string
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db("otp_verifications").where({ email: user.email }).del();

    //Insert OTP record
    await db("otp_verifications").insert({
      email: user.email,
      otp,
      expires_at: expiryTime,
    });
    try {
      await sendEmail(email, "Password Reset OTP", `Your OTP is: ${otp}`);
    } catch (err) {
      console.error("Email send error:", {
        code: err.code,
        command: err.command,
        response: err.response,
      });
      return res.status(502).json({ error: "Failed to send email" });
    }

    return res.status(200).json({
      message: "OTP sent successfully to registered email",
      expiry: expiryTime,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// // ==================== RESET PASSWORD WITH OTP ====================
const resetPasswordWithOTP = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ error: "Email, OTP, and new password are required" });
  }

  try {
    const otpEntry = await db("otp_verifications")
      .where({ email, otp })
      .andWhere("expires_at", ">", new Date())
      .first();

    if (!otpEntry)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db("users")
      .where({ email })
      .update({ password_hash: hashedPassword });

    await db("otp_verifications").where({ email, otp }).del();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Password Reset Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== EMAIL VERIFICATION OTP =================
const generateEmailVerificationOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db("otp_verifications").insert({
      email,
      otp,
      expires_at: expiresAt,
    });

    await sendEmail({
      to: email,
      subject: "Email Verification OTP",
      text: `Your verification OTP is: ${otp}`,
      html: `<h1>Email Verification OTP</h1><p>Your verification OTP is: <strong>${otp}</strong></p>`,
    });

    return res.json({ message: "Verification OTP sent to email." });
  } catch (error) {
    console.error("Email Verification OTP Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== VERIFY EMAIL WITH OTP ====================
const verifyEmailWithOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ error: "Email and OTP are required" });

  try {
    const otpEntry = await db("otp_verifications")
      .where({ email, otp })
      .andWhere("expires_at", ">", new Date())
      .first();

    if (!otpEntry)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    const user = await db("users").where({ email }).first();

    if (user) {
      await db("users").where({ email }).update({ is_verified: true });
      await db("otp_verifications").where({ email, otp }).del();
      return res.json({ message: "Email verified successfully" });
    }

    // For pre-registration verification: just confirm OTP validity
    return res.json({ message: "OTP verified. Complete your registration." });
  } catch (error) {
    console.error("Email Verification Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ================== Logout ==================

const logout = async (req, res) => {
  try {
    res.clearCookie("access_token", {
      ...buildCookieOptions(),
      maxAge: undefined,
    });
    res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Server error during logout" });
  }
};

module.exports = {
  registerStudent,
  login,
  registerAlumni,
  forgotPasswordGenerateOtp,
  resetPasswordWithOTP,
  generateEmailVerificationOTP,
  verifyEmailWithOTP,
  logout,
};
