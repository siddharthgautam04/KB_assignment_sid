// src/services/api.ts
const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined) ??
  '';

let accessToken: string | null = null;

export function setAuthToken(t: string | null) { accessToken = t; }
export function getAuthToken() { return accessToken; }

function headers(json = true): HeadersInit {
  const h: Record<string,string> = {};
  if (json) h['Content-Type'] = 'application/json';
  if (accessToken) h['Authorization'] = `Bearer ${accessToken}`;
  return h;
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  const txt = await res.text();
  let data: any = null;
  try { data = txt ? JSON.parse(txt) : null; } catch {}
  if (!res.ok) {
    throw new Error(data?.error || data?.message || `${res.status} ${res.statusText}`);
  }
  return data as T;
}

export const api = {
  get:  <T>(path: string) => http<T>(path, { headers: headers(false) }),
  post: <T>(path: string, body?: any) =>
    http<T>(path, { method: 'POST', headers: headers(), body: body ? JSON.stringify(body) : undefined }),
  put:  <T>(path: string, body?: any) =>
    http<T>(path, { method: 'PUT', headers: headers(), body: body ? JSON.stringify(body) : undefined }),
  del:  <T>(path: string) => http<T>(path, { method: 'DELETE', headers: headers(false) }),
};