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

  getJobApplicants: (jobId) =>
    apiFetch(`/job/job/${jobId}/applicants`),

  updateJob: (id, body) =>
    apiFetch(`/job/job/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteJob: (id) =>
    apiFetch(`/job/job/${id}`, {
      method: "DELETE",
    }),

  getJobById: (id) => apiFetch(`/job/job/${id}`),

  repostJob: (id) =>
    apiFetch(`/job/job/${id}/repost`, {
      method: "POST",
    }),

  // ---------- Admin ----------
  adminStats: () => apiFetch("/admin/stats"),
  adminUsers: () => apiFetch("/admin/users"),
  adminPendingAlumni: () => apiFetch("/admin/alumni/pending"),
  adminVerifyAlumni: (userId, status) =>
    apiFetch(`/admin/alumni/verify/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  adminApproveCompany: (companyId) =>
    apiFetch(`/admin/companies/${companyId}/approve`, { method: "PATCH" }),
  adminRejectCompany: (companyId) =>
    apiFetch(`/admin/companies/${companyId}/reject`, { method: "PATCH" }),
  adminJobs: () => apiFetch("/admin/jobs"),
  adminJobApplicants: (jobId) => apiFetch(`/admin/jobs/${jobId}/applicants`),
  adminDeleteJob: (id) =>
    apiFetch(`/admin/jobs/${id}`, { method: "DELETE" }),
  adminPromoteUser: (userId) =>
    apiFetch(`/admin/users/${userId}/promote`, { method: "PATCH" }),
  adminDeleteUser: (userId) =>
    apiFetch(`/admin/users/${userId}`, { method: "DELETE" }),
  adminNotify: (message, targetRole) =>
    apiFetch("/admin/notify", {
      method: "POST",
      body: JSON.stringify({ message, targetRole }),
    }),

  // Job application status updates (alumni)
  acceptJobApplication: (applicationId) =>
    apiFetch(`/job/applications/${applicationId}/accept`, { method: "PATCH" }),
  rejectJobApplication: (applicationId) =>
    apiFetch(`/job/applications/${applicationId}/reject`, { method: "PATCH" }),
  holdJobApplication: (applicationId) =>
    apiFetch(`/job/applications/${applicationId}/hold`, { method: "PATCH" }),
};
