const API = "http://127.0.0.1:8000/api";

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

export async function simulate(data) {
  return post("/simulate", data);
}

export async function getScenarios(data) {
  return post("/scenarios", data);
}

export async function getAI(data) {
  return post("/ai-analysis", data);
}
