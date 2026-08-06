const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("hmc_token");

async function request(endpoint, options = {}) {
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