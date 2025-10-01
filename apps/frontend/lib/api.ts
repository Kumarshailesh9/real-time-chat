// apps/frontend/lib/api.ts
export async function apiFetch<T = any>(endpoint: string, init: RequestInit = {}) {
  const base = "http://localhost:5000";
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(base + endpoint, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });

  const text = await res.text();
  // try to parse JSON safely
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

  if (!res.ok) {
    const message = (data && (data.error || data.message)) || res.statusText || "API error";
    throw new Error(message);
  }
  return data as T;
}
