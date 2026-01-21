// frontend/src/lib/api.js 
import { API_BASE_URL } from "../constants"; 
 
const API_BASE = API_BASE_URL; 
 
export function setToken(token) { 
  localStorage.removeItem("api_token"); 
  localStorage.removeItem("token"); 
} 
 
export function getToken() { 
  const legacy = 
    localStorage.getItem("api_token") || localStorage.getItem("token"); 
  if (legacy) { 
    localStorage.removeItem("api_token"); 
    localStorage.removeItem("token"); 
  } 
  return null; 
} 
 
export async function apiFetch(path, options = {}) { 
  const url = `${API_BASE}${path}`; 
  const headers = options.headers ? { ...options.headers } : {}; 
  const isFormData = options.body instanceof FormData; 
 
  if (!isFormData) { 
    headers["Content-Type"] = headers["Content-Type"] || "application/json"; 
  } 
 
  const res = await fetch(url, { 
    credentials: "include", 
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
 
export const apiClient = { 
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
  forgotPassword: (email) => 
    apiFetch("/auth/forgot-password", { 
      method: "POST", 
      body: JSON.stringify({ email }), 
    }), 
  sendVerificationOtp: (email) => 
    apiFetch("/auth/email/send-otp", { 
      method: "POST", 
      body: JSON.stringify({ email }), 
    }), 
  verifyEmailOtp: (email, otp) => 
    apiFetch("/auth/email/verify-otp", { 
      method: "POST", 
      body: JSON.stringify({ email, otp }), 
    }), 
  resetPassword: (email, otp, newPassword) => 
    apiFetch("/auth/reset-password", { 
      method: "POST", 
      body: JSON.stringify({ email, otp, newPassword }), 
    }), 
  getAlumniProfile: () => apiFetch("/alumni/me"), 
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
  getAllCompaniesPublic: () => apiFetch("/job/companies-public", { method: "GET" }),
  getCompanyByIdPublic: (id) => apiFetch(`/job/companies-public/${id}`, { method: "GET" }),
  getCompanyJobsPublic: (companyId, page = 1, limit = 20) => 
    apiFetch(`/job/companies-public/${companyId}/jobs?page=${page}&limit=${limit}`, { method: "GET" }),
  getFeaturedJobsPublic: (limit = 6) => apiFetch(`/job/featured-jobs-public?limit=${limit}`, { method: "GET" }), 
  updateCompany: (id, body) => 
    apiFetch(`/alumni/companies/${id}`, { 
      method: "PUT", 
      body: JSON.stringify(body), 
    }), 
  postJob: (body) => 
    apiFetch("/job/post-job", { 
      method: "POST", 
      body: JSON.stringify(body), 
    }), 
  getMyJobs: () => apiFetch("/job/my-jobs"), 
  getJobApplicants: (jobId) => apiFetch(`/job/job/${jobId}/applicants`), 
  getJobApplicantProfile: (applicationId) => 
    apiFetch(`/job/applications/${applicationId}/profile`), 
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
  adminStats: () => apiFetch("/admin/stats"), 
  adminUsers: () => apiFetch("/admin/users"), 
  adminApplications: () => apiFetch("/admin/applications"), 
  adminJobApplications: (jobId) => 
    apiFetch(`/admin/jobs/${jobId}/applications`), 
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
  adminJobApplicants: (jobId) => apiFetch(`/admin/jobs/${jobId}/applications`), 
  adminDeleteJob: (id) => apiFetch(`/admin/jobs/${id}`, { method: "DELETE" }), 
  adminPromoteUser: (userId) => 
    apiFetch(`/admin/users/${userId}/promote`, { method: "PATCH" }), 
  adminDeleteUser: (userId) => 
    apiFetch(`/admin/users/${userId}`, { method: "DELETE" }), 
  adminNotify: (message, targetRole) => 
    apiFetch("/admin/notify", { 
      method: "POST", 
      body: JSON.stringify({ message, targetRole }), 
    }), 
  acceptJobApplication: (applicationId) => 
    apiFetch(`/job/applications/${applicationId}/accept`, { method: "PATCH" }), 
  rejectJobApplication: (applicationId) => 
    apiFetch(`/job/applications/${applicationId}/reject`, { method: "PATCH" }), 
  holdJobApplication: (applicationId) => 
    apiFetch(`/job/applications/${applicationId}/hold`, { method: "PATCH" }), 
};