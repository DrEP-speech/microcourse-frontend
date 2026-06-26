const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000").replace(/\/+$/, "");

const TOKEN_KEY = "mc_token";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return window.localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

type ApiFetchOpts = RequestInit & {
  auth?: boolean;
  json?: any;
};

// Resolves a bare path like "courses/123" or "quizzes/abc/submit" against the
// real backend, always under the /api prefix (e.g. http://localhost:4000/api/courses/123).
// Returns the parsed response body directly and throws an Error with a useful
// message on any non-2xx response, so callers can use plain try/catch.
export async function apiFetch<T = any>(
  path: string,
  opts: ApiFetchOpts = {}
): Promise<T> {
  const cleanPath = path.replace(/^\/+/, "");
  const url = path.startsWith("http")
    ? path
    : `${API_BASE}/api/${cleanPath}`;

  const headers = new Headers(opts.headers || {});
  if (opts.json !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (opts.auth !== false) {
    const token = getStoredToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...opts,
    headers,
    body: opts.json !== undefined ? JSON.stringify(opts.json) : opts.body,
  });

  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const errMsg =
      (body && (body.message || body.error)) ||
      (typeof body === "string" && body) ||
      `HTTP ${res.status}`;
    throw new Error(errMsg);
  }

  return body as T;
}
