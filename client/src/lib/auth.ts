export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function getToken(): string | null {
  return localStorage.getItem("sn_token");
}

export function setToken(token: string): void {
  localStorage.setItem("sn_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("sn_token");
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem("sn_user");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setUser(user: AuthUser): void {
  localStorage.setItem("sn_user", JSON.stringify(user));
}

export function logout(): void {
  localStorage.removeItem("sn_token");
  localStorage.removeItem("sn_user");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest(method: string, path: string, body?: any): Promise<any> {
  const res = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}
