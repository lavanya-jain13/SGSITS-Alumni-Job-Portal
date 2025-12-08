// Default to backend port 5000 (matches backend/.env) unless overridden.
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ---------------------------
// Token Helpers
// ---------------------------
export function setToken(token) {
  if (token) localStorage.setItem("api_token", token);
  else localStorage.removeItem("api_token");
}

export function getToken() {
  // fallback for older sessions that stored "token"
  return localStorage.getItem("api_token") || localStorage.getItem("token");
}

// ---------------------------
// Generic API Fetch Wrapper
// ---------------------------
export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = options.headers || {};
  const token = getToken();

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  headers["Content-Type"] = headers["Content-Type"] || "application/json";

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const text = await res.text();
  const parsed = text ? safeParseJson(text) : null;

  if (!res.ok) {
    const message =
      (parsed && (parsed.error || parsed.message)) ||
      res.statusText ||
      "Request failed";
    const error = new Error(message);
    error.status = res.status;
    error.data = parsed;
    throw error;
  }

  return parsed;
}

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (_err) {
    return text;
  }
}

// ---------------------------
// Parse JWT Token
// ---------------------------
export function parseJwt(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (err) {
    return null;
  }
}

// ---------------------------
// API Client (USED IN Login.jsx)
// ---------------------------
export const apiClient = {
  // LOGIN API
  login: (body) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  registerStudent: (body) =>
    apiFetch("/auth/register/student", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  registerAlumni: (body) =>
    apiFetch("/auth/register/alumni", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Alumni profile/company
  completeAlumniProfile: (body) =>
    apiFetch("/alumni/profile", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateAlumniProfile: (body) =>
    apiFetch("/alumni/update-profile", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  addCompany: (body) =>
    apiFetch("/alumni/add-company", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getMyCompanies: () => apiFetch("/alumni/companies"),

  getCompanyById: (id) => apiFetch(`/alumni/companies/${id}`),

  updateCompany: (id, body) =>
    apiFetch(`/alumni/companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  // Alumni jobs
  postJob: (body) =>
    apiFetch("/job/post-job", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getMyJobs: () => apiFetch("/job/my-jobs"),
};
