# AGENTS.md

## Project identity
This repository is the MicroCourse beta-release frontend. Pairs with the
`microcourse-backend-final-clean` repo (Express + MongoDB Atlas, runs on
port 4000). Primary goal: prepare for a controlled live beta.

## Architecture (verified 2026-06-24)
- Framework: Next.js 14.1.0, App Router (`app/`)
- `pages_legacy/`, `src/`, and the nested `backend/`/`frontend/` folders
  that used to exist here were dead duplicates from earlier iterations —
  moved to `_ARCHIVED_20260624/`. Do not resurrect them or treat anything
  under `_ARCHIVED_20260624/` as live code. The App Router (`app/`) is the
  only real frontend.
- Real third-party deps actually imported by live code: `next`, `react`,
  `react-dom`, `axios`, `jspdf`, `jspdf-autotable`, `mongoose`. TypeScript
  is used (`tsconfig.json`, `.tsx` files exist), so `typescript`,
  `@types/react`, `@types/react-dom`, `@types/node` must stay in
  `devDependencies`.

## Known incident (2026-06-24)
A prior cleanup pass ("zipfix") had stripped `package.json` down to just
3 packages, silently deleting the TypeScript and axios/jspdf/mongoose
dependencies the app actually needs — this broke `next dev`/`next build`
outright (it can't even start without `typescript` installed once
`tsconfig.json` is present). Fixed 2026-06-24. If `npm run dev` ever fails
again with "It looks like you're trying to use TypeScript but do not have
the required package(s) installed," check `package.json` against the
actual imports in `app/`, `components/`, `lib/` before assuming it's a new
bug — it's likely the same dependency-stripping issue recurring.

Separately, `.gitignore` was previously saved as UTF-16, so none of its
rules (including `.env`) were ever actually honored by git — a real
MongoDB Atlas credential ended up committed in `.env` as a result. Fixed:
`.gitignore` rewritten as plain UTF-8, `.env` credential removed and
untracked. Keep `.gitignore` as plain UTF-8/ASCII going forward, and never
verify it by eye alone — `cat -A` or `file .gitignore` will catch encoding
regressions that look fine in an editor.

## Working rules
- Make minimal safe changes; do not rewrite architecture unless asked.
- Do not put backend secrets (MONGO_URI, JWT_SECRET, etc.) in any frontend
  env file. Frontend only needs `NEXT_PUBLIC_API_BASE` (and `API_BASE` for
  server-side calls) pointing at the backend.
- Keep API base URL usage environment-driven (`NEXT_PUBLIC_API_BASE`),
  never hardcode `localhost` for production paths.
- Prefer small, reviewable patches. Explain what changed and why.

## Frontend expectations
- Dev command: `npm run dev` (port 3000)
- Build command: `npm run build`
- Preserve dashboard, course, lesson, quiz, and auth flows in `app/`.

## Prohibitions
- Do not invent environment variables.
- Do not add new dependencies without checking they're actually imported.
- Do not convert the project to a different framework or router style.

## Live navigation path vs. dead duplicates (found/fixed 2026-06-24)
The only quiz flow actually reachable from real navigation is:
`app/course/[courseId]/page.jsx` -> click a quiz button ->
`app/quiz/[quizId]/page.jsx`. Both use `lib/http.ts`'s `apiFetch`.

This path had several real bugs, now fixed:
- `lib/http.ts` built URLs without the `/api` prefix the backend actually
  uses (e.g. hit `/courses/:id` instead of `/api/courses/:id`), and returned
  a `{ok,status,data,error}` wrapper that callers never unwrapped. Fixed:
  `apiFetch` now always prefixes `/api/` and returns the parsed body
  directly, throwing on non-2xx so callers can keep using try/catch.
- `app/course/[courseId]/page.jsx` read `course.quizzes` /
  `course.quizIds` to find quizzes for a course — but the backend `Course`
  model has no such field; `Quiz` only stores a back-reference `courseId`.
  This made "no quizzes found" permanent regardless of seed data. Fixed:
  now fetches `GET /api/quizzes` and filters client-side by `courseId`.
- `app/quiz/[quizId]/page.jsx` rendered free-text inputs for answers and
  posted to a nonexistent `POST /api/quizzes/submit` (no `:id`, wrong verb
  target). The real backend contract is multiple-choice:
  `POST /api/quizzes/:id/submit` with `{ answers: [choiceIndex, ...] }`
  (index-aligned with `quiz.questions`), and `GET /api/quizzes/:id/result`
  for the latest persisted result. Fixed: page now renders radio buttons
  from each question's `choices` array, submits an index-aligned answers
  array, and loads the last persisted result on mount so a refresh or
  re-login still shows the saved outcome.

**Known dead code — archived 2026-06-24:**
The entire `app/quizzes/` tree (including `QuizPlayerClient.jsx`,
`quiz-mc-101/`, `[quizId]/results`, `[quizId]/review`), `app/api/quizzes/*`
proxy routes, and `components/QuizPlayerClient.jsx` all scored quizzes
entirely client-side against a hardcoded fallback quiz and never called the
real backend submit/result endpoints correctly (wrong path, fire-and-forget,
no auth header). None were linked from any real page. Moved into
`_ARCHIVED_20260624/`. The two now-empty original directories
(`app/quizzes/`, `app/api/quizzes/`) couldn't be fully removed due to a
sandbox permission quirk but contain no files — harmless, Next only
generates routes from directories with a `page`/`route` file. Delete them
manually if you want them gone. The real quiz flow is
`app/course/[courseId]/page.jsx` -> `app/quiz/[quizId]/page.jsx`.

## Vercel env vars
`.env.example` previously said `NEXT_PUBLIC_API_BASE_URL` (wrong name, wrong
default port 5000) — the actual code everywhere uses `NEXT_PUBLIC_API_BASE`.
Fixed 2026-06-24. When deploying to Vercel, set `NEXT_PUBLIC_API_BASE` to
the deployed Render backend's root URL (no trailing slash, no `/api`).
