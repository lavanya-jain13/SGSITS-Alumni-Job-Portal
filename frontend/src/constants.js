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
// Priority: explicit VITE_API_URL env var → production build → localhost.
// Set VITE_API_URL in frontend/.env to override for any mode (e.g. run dev
// against the live API by setting VITE_API_URL=https://sgsits-alumni-jobs.com/api).
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
    ? PROD_API_BASE_URL
    : LOCAL_API_BASE_URL);

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
  import.meta.env.VITE_WS_URL ||
  (import.meta.env.MODE === "production"
    ? "wss://sgsits-alumni-jobs.com"
    : "ws://localhost:5004");
