const API = import.meta.env.VITE_API_URL || "https://planora-8.onrender.com/api";

async function post(path, data) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload;
}

async function get(path) {
  const res = await fetch(`${API}${path}`);
  const payload = await res.json();

  if (!res.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload;
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
