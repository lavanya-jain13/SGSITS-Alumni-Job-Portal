// frontend/src/constants.js

// ----------------------------
// Base URLs
// ----------------------------

// Local backend URL (your laptop)
export const LOCAL_API_BASE_URL = "http://localhost:5004/api";

// Production backend URL (AWS EC2) - keep existing public IP as default
export const PROD_API_BASE_URL = "http://18.217.68.204/api";

// ----------------------------
// Auto switch (Env override > Prod in production > Local otherwise)
// ----------------------------
const ENV_API = import.meta.env?.VITE_API_URL;
export const API_BASE_URL =
  ENV_API ||
  (import.meta.env?.MODE === "production"
    ? PROD_API_BASE_URL
    : LOCAL_API_BASE_URL);

// ----------------------------
// Common endpoint groups
// ----------------------------

// Authentication
export const AUTH_URL = `${API_BASE_URL}/auth`;

// Jobs
export const JOB_URL = `${API_BASE_URL}/jobs`;

// Job Applications
export const JOB_APPLICATION_URL = `${API_BASE_URL}/applications`;

// Alumni / Student Profiles
export const PROFILE_URL = `${API_BASE_URL}/profile`;

// File Uploads (if Cloudinary or local upload exists)
export const UPLOAD_URL = `${API_BASE_URL}/upload`;

// Companies (if used)
export const COMPANY_URL = `${API_BASE_URL}/companies`;

// ----------------------------
// WebSocket (Only if your project uses it)
// ----------------------------
// 1. If VITE_WS_URL is set, use that
// 2. Else, switch based on mode
export const WS_URL =
  import.meta.env?.VITE_WS_URL ||
  (import.meta.env?.MODE === "production"
    ? "ws://18.217.68.204"
    : "ws://localhost:5004");
