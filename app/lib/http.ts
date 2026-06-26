export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://127.0.0.1:4000";

const TOKEN_KEY = "microcourse_token";

export function setStoredToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function clearStoredToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

type ApiFetchOpts = RequestInit & {
  auth?: boolean;
  json?: any;
};

export async function apiFetch(path: string, opts: ApiFetchOpts = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string> | undefined),
  };

  if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (opts.auth) {
    const token = getStoredToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...opts,
    headers,
    body: opts.json !== undefined ? JSON.stringify(opts.json) : opts.body,
  });

  return res;
}
