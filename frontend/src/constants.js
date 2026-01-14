// frontend/src/constants.js

// ----------------------------
// Base URLs
// ----------------------------

// Local backend (development)
export const LOCAL_API_BASE_URL = "http://localhost:5004/api";

// Production backend (AWS EC2)
export const PROD_API_BASE_URL = "https://sgsits-alumni-jobs.com/api";

// ----------------------------
// Auto switch based on mode
// ----------------------------
// Vite runs in "development" or "production"
export const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://sgsits-alumni-jobs.com/api"
    : "http://localhost:5004/api";

// ----------------------------
// Common endpoint groups
// ----------------------------

export const AUTH_URL = `${API_BASE_URL}/auth`;
export const JOB_URL = `${API_BASE_URL}/job`;
export const JOB_APPLICATION_URL = `${API_BASE_URL}/applications`;
export const PROFILE_URL = `${API_BASE_URL}/profile`;
export const UPLOAD_URL = `${API_BASE_URL}/upload`;
export const COMPANY_URL = `${API_BASE_URL}/companies`;

// ----------------------------
// WebSocket
// ----------------------------
export const WS_URL =
  import.meta.env.MODE === "production"
    ? "wss://sgsits-alumni-jobs.com"
    : "ws://localhost:5004";
