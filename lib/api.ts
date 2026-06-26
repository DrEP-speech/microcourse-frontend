"use client";

export const API_MODULE_SIGNATURE = "lib/api@v1";

const TOKEN_KEY = "mc_token";

export function getApiBase(): string {
  return (
    (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000").replace(/\/+$/, "")
  );
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return window.localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(TOKEN_KEY, token); } catch {}
}

export function setClientToken(token: string): void {
  setStoredToken(token);
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(TOKEN_KEY); } catch {}
}

export class ApiError extends Error {
  status: number;
  details: any;
  constructor({ status, message, details }: { status: number; message: string; details?: any }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type ApiFetchOpts = {
  method?: string;
  body?: any;
  noAuth?: boolean;
  auth?: boolean;
  headers?: Record<string, string>;
};

export async function apiFetch<T = any>(path: string, opts: ApiFetchOpts = {}): Promise<T> {
  const base = getApiBase();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };

  if (!opts.noAuth && opts.auth !== false) {
    const token = getStoredToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const msg =
      (body && (body.message || body.error)) ||
      (typeof body === "string" && body) ||
      `HTTP ${res.status}`;
    throw new ApiError({ status: res.status, message: msg, details: body });
  }

  return body as T;
}

export async function apiGet<T = any>(path: string, opts?: Omit<ApiFetchOpts, "method">): Promise<T> {
  return apiFetch<T>(path, { ...opts, method: "GET" });
}

export async function apiPost<T = any>(path: string, body?: any, opts?: Omit<ApiFetchOpts, "method" | "body">): Promise<T> {
  return apiFetch<T>(path, { ...opts, method: "POST", body });
}

export async function apiPut<T = any>(path: string, body?: any, opts?: Omit<ApiFetchOpts, "method" | "body">): Promise<T> {
  return apiFetch<T>(path, { ...opts, method: "PUT", body });
}

export async function apiDel<T = any>(path: string, opts?: Omit<ApiFetchOpts, "method">): Promise<T> {
  return apiFetch<T>(path, { ...opts, method: "DELETE" });
}

export const api = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  del: apiDel,
  fetch: apiFetch,
};

export default { apiFetch, apiGet, apiPost, apiPut, apiDel, getApiBase, getStoredToken, setStoredToken, setClientToken, clearStoredToken, api };
