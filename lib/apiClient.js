const DEFAULT_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:11001';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function withTimeout(ms) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(id) };
}

function normalizeError(err, fallbackMessage = 'Request failed') {
  if (!err) return { message: fallbackMessage };
  if (typeof err === 'string') return { message: err };
  if (err.name === 'AbortError') return { message: 'Request timed out' };
  if (err.message) return { message: err.message };
  return { message: fallbackMessage };
}

function shouldRetry(status) {
  // retry transient errors only
  return [408, 429, 500, 502, 503, 504].includes(status);
}

export async function apiFetch(path, options = {}) {
  const {
    method = 'GET',
    body,
    token,
    headers = {},
    baseUrl = DEFAULT_BASE,
    timeoutMs = 12000,
    retries = 2,
    retryBaseDelayMs = 350,
    retryMaxDelayMs = 1600,
  } = options;

  const url = path.startsWith('http') ? path : (baseUrl.replace(/\/$/, '') + path);

  let attempt = 0;
  while (true) {
    attempt += 1;
    const t = withTimeout(timeoutMs);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: \Bearer \\ } : {}),
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: t.controller.signal,
        cache: 'no-store',
      });

      t.clear();

      const contentType = res.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

      if (!res.ok) {
        const err = {
          status: res.status,
          message: (data && (data.error || data.message)) || \HTTP \\,
          details: data && (data.details || data),
          path,
        };

        if (attempt <= retries + 1 && shouldRetry(res.status)) {
          const delay = Math.min(retryMaxDelayMs, retryBaseDelayMs * Math.pow(2, attempt - 1));
          await sleep(delay);
          continue;
        }

        throw err;
      }

      return data;
    } catch (err) {
      t.clear();

      // network errors / timeouts
      const norm = normalizeError(err);
      const status = err && err.status ? err.status : 0;

      if (attempt <= retries + 1 && (status === 0 || shouldRetry(status))) {
        const delay = Math.min(retryMaxDelayMs, retryBaseDelayMs * Math.pow(2, attempt - 1));
        await sleep(delay);
        continue;
      }

      throw (err && err.message) ? err : { status, ...norm, path };
    }
  }
}

export const api = {
  health: () => apiFetch('/health'),
  register: (payload) => apiFetch('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => apiFetch('/api/auth/login', { method: 'POST', body: payload }),

  // Courses
  listCourses: () => apiFetch('/api/courses'),
  getCourse: (courseId) => apiFetch(\/api/courses/\\),

  // Quizzes
  listQuizzes: () => apiFetch('/api/quizzes'),
  getQuiz: (quizId) => apiFetch(\/api/quizzes/\\),

  // Lessons (optional)
  listLessons: () => apiFetch('/api/lessons'),
};
