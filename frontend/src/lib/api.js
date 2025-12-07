const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5004/api";

// ---------------------------
// Token Helpers
// ---------------------------
export function setToken(token) {
  if (token) localStorage.setItem("api_token", token);
  else localStorage.removeItem("api_token");
}

export function getToken() {
  return localStorage.getItem("api_token");
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
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (err) {
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

  // You can add more APIs here later:
  // register: (body) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  // getUser: () => apiFetch("/auth/user"),
};
