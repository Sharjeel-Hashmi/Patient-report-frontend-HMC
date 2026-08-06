const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("hmc_token");
const getRefreshToken = () => localStorage.getItem("hmc_refresh_token");

const setTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem("hmc_token", accessToken);
  if (refreshToken) localStorage.setItem("hmc_refresh_token", refreshToken);
};

const clearSession = () => {
  localStorage.removeItem("hmc_token");
  localStorage.removeItem("hmc_refresh_token");
  localStorage.removeItem("hmc_user");
};

// Ensures only one /auth/refresh call is in-flight at a time — if several API
// calls 401 at once (e.g. dashboard loading multiple things in parallel), they
// all share the same refresh attempt instead of racing each other.
let refreshPromise = null;

async function performRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Session expired");

  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

// Called when the refresh token itself is invalid/expired — session is truly
// over, so clear everything and send the user back to login.
function forceSessionExpired() {
  clearSession();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

async function request(endpoint, options = {}, isRetry = false) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Access token expired mid-session -> silently refresh once, then retry the
  // original request. Auth endpoints themselves are excluded to avoid loops.
  const isAuthEndpoint = endpoint.startsWith("/auth/");
  if (res.status === 401 && !isRetry && !isAuthEndpoint) {
    try {
      if (!refreshPromise) refreshPromise = performRefresh().finally(() => { refreshPromise = null; });
      await refreshPromise;
      return request(endpoint, options, true);
    } catch {
      forceSessionExpired();
      throw new Error("Session expired, please log in again");
    }
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.message || "Something went wrong");
  }
  return data;
}

export const api = {
  // Auth
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  signup: (name, email, password) =>
    request("/auth/signup", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  me: () => request("/auth/me"),
  changeEmail: (newEmail, password) =>
    request("/auth/change-email", { method: "PUT", body: JSON.stringify({ newEmail, password }) }),
  changePassword: (currentPassword, newPassword) =>
    request("/auth/change-password", { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) }),
  logout: () => {
    const refreshToken = getRefreshToken();
    // Best-effort — even if this fails (offline etc.), local session is cleared by AuthContext regardless.
    return fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  },

  // Patients
  getPatients: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/patients${qs ? `?${qs}` : ""}`);
  },
  getPatient: (id) => request(`/patients/${id}`),
  createPatient: (payload) => request("/patients", { method: "POST", body: JSON.stringify(payload) }),
  updatePatient: (id, payload) => request(`/patients/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deletePatient: (id) => request(`/patients/${id}`, { method: "DELETE" }),

  // Reports (nested under patient)
  addReport: (patientId, payload) =>
    request(`/patients/${patientId}/reports`, { method: "POST", body: JSON.stringify(payload) }),
  updateReport: (patientId, reportId, payload) =>
    request(`/patients/${patientId}/reports/${reportId}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteReport: (patientId, reportId) =>
    request(`/patients/${patientId}/reports/${reportId}`, { method: "DELETE" }),

  // Labs
  getLabs: () => request("/labs"),
  createLab: (name) => request("/labs", { method: "POST", body: JSON.stringify({ name }) }),
  deleteLab: (id) => request(`/labs/${id}`, { method: "DELETE" }),

  // Dashboard
  getDashboardStats: () => request("/dashboard"),

  // Visit Types (master data)
  getVisitTypes: () => request("/visit-types"),
  createVisitType: (name) => request("/visit-types", { method: "POST", body: JSON.stringify({ name }) }),
  updateVisitType: (id, payload) => request(`/visit-types/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteVisitType: (id) => request(`/visit-types/${id}`, { method: "DELETE" }),

  // Conditions (master data)
  getConditions: () => request("/conditions"),
  createCondition: (name) => request("/conditions", { method: "POST", body: JSON.stringify({ name }) }),
  updateCondition: (id, payload) => request(`/conditions/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteCondition: (id) => request(`/conditions/${id}`, { method: "DELETE" }),

  // Medications (master data)
  getMedications: () => request("/medications"),
  createMedication: (name, dosages) =>
    request("/medications", { method: "POST", body: JSON.stringify({ name, dosages }) }),
  updateMedication: (id, payload) => request(`/medications/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteMedication: (id) => request(`/medications/${id}`, { method: "DELETE" }),

  // Consultations (nested under patient)
  getConsultations: (patientId) => request(`/patients/${patientId}/consultations`),
  getConsultation: (patientId, consultationId) =>
    request(`/patients/${patientId}/consultations/${consultationId}`),
  addConsultation: (patientId, payload) =>
    request(`/patients/${patientId}/consultations`, { method: "POST", body: JSON.stringify(payload) }),
  updateConsultation: (patientId, consultationId, payload) =>
    request(`/patients/${patientId}/consultations/${consultationId}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteConsultation: (patientId, consultationId) =>
    request(`/patients/${patientId}/consultations/${consultationId}`, { method: "DELETE" }),
};

export { getToken };