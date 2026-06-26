export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000";

const TOKEN_KEY = "mc_token";

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

type ApiFetchOptions = RequestInit & {
  json?: any;
  auth?: boolean; // default true
};

export async function apiFetch<T = any>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(options.headers || {});
  const wantsAuth = options.auth !== false;

  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  if (options.json !== undefined) {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  }

  if (wantsAuth && !headers.has("Authorization")) {
    const token = getStoredToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    const errBody = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");
    const msg =
      (errBody && (errBody.message || errBody.error)) ||
      (typeof errBody === "string" && errBody) ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return (isJson ? await res.json() : (await res.text() as any)) as T;
}