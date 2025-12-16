// frontend/src/constants.js

// ----------------------------
// Base URLs
// ----------------------------

// Local backend (development)
export const LOCAL_API_BASE_URL = "http://localhost:5004/api";

// Production backend (AWS EC2)
export const PROD_API_BASE_URL = "http://18.217.68.204/api";

// ----------------------------
// Auto switch based on mode
// ----------------------------
// Vite runs in "development" or "production"
export const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? LOCAL_API_BASE_URL
    : PROD_API_BASE_URL;

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
    ? "ws://18.217.68.204"
    : "ws://localhost:5004";
