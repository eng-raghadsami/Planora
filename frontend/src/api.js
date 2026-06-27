const API = import.meta.env.VITE_API_URL || "https://planora-8.onrender.com/api";
const TOKEN_KEY = "planora_auth_token";

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function parseResponse(res) {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return res.json();
  }

  const text = await res.text();
  const preview = text.replace(/\s+/g, " ").slice(0, 120);
  throw new Error(
    `Backend returned ${res.status} ${res.statusText || "error"} instead of JSON. ${preview}`
  );
}

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getErrorMessage(payload, fallback = "Request failed") {
  const validationErrors = payload?.errors ? Object.values(payload.errors).flat() : [];
  return validationErrors[0] || payload?.message || fallback;
}

async function post(path, data, { auth = false } = {}) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(auth ? authHeaders() : {}) },
    body: JSON.stringify(data),
  });

  const payload = await parseResponse(res);
  if (!res.ok) {
    throw new Error(getErrorMessage(payload));
  }

  return payload;
}

async function get(path, { auth = false } = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: auth ? authHeaders() : {},
  });
  const payload = await parseResponse(res);

  if (!res.ok) {
    throw new Error(getErrorMessage(payload));
  }

  return payload;
}

export async function registerUser(data) {
  const payload = await post("/auth/register", data);
  setAuthToken(payload.token);
  return payload;
}

export async function loginUser(data) {
  const payload = await post("/auth/login", data);
  setAuthToken(payload.token);
  return payload;
}

export async function getCurrentUser() {
  return get("/auth/me", { auth: true });
}

export async function logoutUser() {
  try {
    await post("/auth/logout", {}, { auth: true });
  } finally {
    setAuthToken(null);
  }
}

export async function simulate(data) {
  return post("/simulate", data);
}

export async function getSimulationOptions() {
  return get("/simulation-options");
}

export async function prepareSimulationInput(data) {
  return post("/simulation-input", data);
}

export async function getScenarios(data) {
  return post("/scenarios", data);
}

export async function getAI(data) {
  return post("/ai-analysis", data);
}

export async function compareLocations(data) {
  return post("/location-comparison", data);
}

export async function getHomeContent() {
  return get("/home-content");
}

export async function getPricingPlans() {
  return get("/pricing-plans");
}
