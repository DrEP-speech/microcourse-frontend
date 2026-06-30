# LexiMind Academy Project Status

_Generated for hand-off to another AI assistant (ChatGPT) so it can understand the current state of the app without re-deriving it from scratch. No secrets, passwords, API keys, database credentials, or `.env` contents are included anywhere below._

## 1. Project Overview

This is a two-repo web application: a Next.js frontend (`microcourse-frontend`) and an Express/MongoDB backend (`microcourse-backend-final-clean`). The app started as "MicroCourse," a short-form course/quiz learning platform for therapy professionals (speech, occupational, physical therapy, behavioral health, psychology). It is in the middle of a brand transition to **LexiMind Academy**, the education/CEU/certification arm of a larger "LexiMind" parent brand that also includes a separate **LexiMind Marketplace** (a therapy-services marketplace, not part of this codebase as far as has been found).

Functionally, the app today supports: account registration/login with roles, a course/lesson/quiz catalog, a CEU (continuing-education-credit) course pathway with certificates, and several specialized "professional ↔ caregiver/client" tools (mood check-ins, choice boards, movement breaks, microlearning swipe-lessons) aimed at therapy providers working with clients/caregivers. It is not a generic LMS — the client/caregiver/professional tooling is the most built-out part of the app.

A first rebrand pass has already been completed: public-facing text, nav, SEO titles, and a new `/academy` landing page now say "LexiMind Academy." Internal routes, database names, and environment variables were deliberately left unchanged to avoid breaking anything.

## 2. Current Brand Status

- **"MicroCourse" / "MicroCourse App" / "MicroCourse Platform"** — removed from all live, user-facing UI (nav brand text, homepage, login, register, layout `<title>`/meta description). Internal dev docs (`AGENTS.md`, `README.md`, `README_FRONTEND.md`) still say "MicroCourse" — these are not shipped UI and were intentionally left alone.
- **"LexiMind Academy"** — now the brand name shown in the nav, homepage hero, login/register eyebrow text, page `<title>`, and the new `/academy` landing page.
- **"LexiMind Marketplace"** — referenced only as a forward-pointing concept on the `/academy` page ("Connected to LexiMind Marketplace" CTA strip). No Marketplace code, routes, or models exist in this codebase — it appears to be a separate product/repo.
- **"MicroCourse" as a lowercase format word** — intentionally kept in a few places (e.g., "MicroCourses" as one of the Learning Formats on `/academy`, and lowercase "micro-courses"/"microcourses" in a couple of body-copy sentences) to describe the *course format*, not a product name. This matches the intended brand architecture: MicroCourses are a learning format inside LexiMind Academy, not a competing product name.
- **Mixed/outdated naming still present (not yet changed, by design)**: the npm package names (`microcourse-frontend`, `microcourse-backend`), the two repo folder names, the MongoDB database name default (`microcourse`), a `service: "microcourse-backend"` field returned by health-check endpoints, PM2 process name `microcourse-api`, and a large number of OpenAPI/Postman dev-tooling files. A full file-by-file breakdown of every remaining reference, with risk-leveled recommendations, exists in a separate audit report (`rebrand-audit.md`, produced earlier in this engagement, not committed to either repo).
- **Is "MicroCourse" a product name or just a format now?** As of this rebrand pass, it is **only a course-format term** ("MicroCourses") used inside LexiMind Academy. It is no longer used anywhere live as the name of the overall app/product.

## 3. Tech Stack

**Frontend (`microcourse-frontend`)**
- Framework: Next.js 14.1.0, App Router (`app/` directory only — confirmed the canonical, live routing tree; other top-level folders are not part of the route tree, see Section 14)
- UI: React 18.2.0, plain CSS (`app/globals.css`, design-token based, no Tailwind/UI library in the live app despite a `tailwind.config.cjs` file existing)
- Language: mix of TypeScript (`.tsx`) and plain JavaScript (`.js`/`.jsx`) — TypeScript is required (`tsconfig.json` present) even for the `.js` pages
- HTTP/data: two parallel client-side fetch helpers, `lib/http.ts` (`apiFetch`) and `lib/api.ts` (`apiGet`/`apiPost`/`apiPut`/`apiDel`) — both prefix calls with `/api/` and read the same auth token
- Auth token storage: browser localStorage, key `mc_token` (set/read via `lib/auth.ts`)
- Package manager: npm (`package-lock.json` present)
- Deployment target: Vercel (per `AGENTS.md` and `.env.example` comments; no `vercel.json` committed — config is presumably set in the Vercel dashboard)

**Backend (`microcourse-backend-final-clean`)**
- Framework: Express 4.x, CommonJS
- Database: MongoDB via Mongoose ^9.2.1 (MongoDB Atlas in production, per `AGENTS.md`)
- Auth: JWT (`jsonwebtoken`), passwords hashed with `bcryptjs`; bearer-token middleware (`requireAuth`) plus a role-based middleware (`requireRole`)
- Other middleware: `helmet`, `cors`, `compression`, `cookie-parser`, `express-rate-limit` (dependency present; not confirmed wired into `app.js`)
- Logging: `pino`/`pino-http`/`pino-pretty` (dependencies present)
- Validation: `zod` (dependency present)
- Testing: Jest + Supertest + `mongodb-memory-server`; Newman (Postman CLI) for API contract/smoke tests
- Package manager: npm
- Deployment target: Render (per `.env.example` comments — "On Render: ..."); no `render.yaml` committed, config presumably set in the Render dashboard

## 4. Current Folder Structure

**Frontend — `microcourse-frontend`** (excluding `node_modules`, `.git`, `.next`, `dist`, `build`, `coverage`, archived/log/report clutter)

```
app/                          ← the only live Next.js route tree (App Router)
  academy/page.tsx             /academy
  api/[...path]/route.ts       catch-all API proxy route
  api/courses/route.ts
  api/health/route.ts
  auth/page.tsx, auth/login/page.tsx
  caregiver/page.tsx
  caregiver/boards/page.tsx
  caregiver/breaks/page.tsx
  caregiver/lessons/page.tsx
  courses/page.tsx
  courses/[courseId]/page.tsx
  dashboard/layout.tsx, dashboard/page.tsx
  health/page.tsx
  instructor/analytics/page.jsx
  login/page.tsx
  professional/page.tsx
  professional/ceu/page.tsx
  professional/ceu/[courseId]/page.tsx
  professional/ceu/certificates/page.tsx
  professional/clients/[id]/page.tsx
  professional/clients/[id]/boards/page.tsx
  professional/clients/[id]/breaks/page.tsx
  professional/clients/[id]/lessons/page.tsx
  quiz/[quizId]/page.jsx
  register/page.js
  layout.tsx, page.tsx, providers.tsx, error.js, not-found.tsx, globals.css, icon.svg
components/                   shared client components (SiteNav, CoursesClient, CourseDetailsClient, LoginClient, etc.)
lib/                           api.ts, auth.ts, http.ts — API clients + token helpers
contexts/, hoc/, hooks/        AuthContext, ToastContext, withAuth, useUser
services/                      lessonApi.ts, videoApi.ts
utils/                         client-side helpers (PDF export, audit logging, badge sync, cloudinary upload, etc.)
public/                        static assets
styles/                        legacy globals.css (superseded by app/globals.css)
e2e/, tests/, __tests__/       Playwright + Jest test suites
scripts/                       dev/build/ops PowerShell + Node scripts
docs/                          OpenAPI spec files
speech-assess-api/             separate sub-app with its own package.json/server.js (unrelated microservice living inside this repo)
admin/, api/, controllers/, models/, data/   top-level folders NOT under app/ — not part of the live route tree (see Section 14)
server.js                      legacy/alternate server entry, not the Next.js dev/start path
```

**Backend — `microcourse-backend-final-clean`**

```
app.js                         Express app + all route mounting (the real source of truth for live endpoints)
server.js                      boots app.js, connects Mongoose, listens on PORT
routes/        23 route files (see Section 6 for which are actually mounted)
controllers/    35 controller files, including stub files (_notImplemented.js, _stubs.js) and
                duplicate singular/plural pairs (badgeController/badgesController,
                insightController/insightsController, notificationController/notificationsController,
                quizController/quizzesController, resultController/resultsController)
models/         21 Mongoose models (full list in Section 12)
middleware/     requireAuth.js, requireRole.js, and others
docs/           OpenAPI specs, Postman environment/collection files (multiple near-duplicates)
postman/, tools/  additional Postman collections and QA tooling
scripts/        seed scripts, PowerShell ops/QA scripts (Newman, gate checks, smoke tests)
tests/          ~30 Jest test files (auth, courses, lessons, quizzes, health/readiness, middleware, openapi)
public/         api-docs.html (served API documentation page)
```

## 5. Current Routes and Pages

Only routes that exist under `app/` (the live Next.js App Router tree) are listed — these are the only ones Next.js actually serves.

| Route | Purpose |
|---|---|
| `/` | Homepage — hero, brand pitch, links into `/academy` and `/courses` |
| `/academy` | LexiMind Academy landing page — disciplines, learning formats, featured course, Marketplace cross-link |
| `/login` | Login form (email/password), stores JWT on success |
| `/register` | Registration form (name/email/password), self-assignable roles: student, caregiver, professional |
| `/auth`, `/auth/login` | A second, separate auth-page tree alongside `/login` — appears to be an older/parallel login flow (see Section 14) |
| `/dashboard` | Post-login landing page; renders different cards depending on the user's role (caregiver, professional) |
| `/courses` | Course catalog grid, pulls `GET /api/courses` |
| `/courses/[courseId]` | Course detail — lessons list (expandable answers) and any linked quizzes |
| `/quiz/[quizId]` | Multiple-choice quiz player — submits answers, shows last persisted result |
| `/health` | Frontend-side health check page |
| `/caregiver` | Caregiver portal home — mood/regulation check-in |
| `/caregiver/boards` | Caregiver: visual choice-board player |
| `/caregiver/breaks` | Caregiver: guided movement/sensory break player |
| `/caregiver/lessons` | Caregiver: microlearning swipe-card lesson player |
| `/professional` | Professional portal — client roster + check-in history |
| `/professional/clients/[id]` | Single client detail view |
| `/professional/clients/[id]/boards` | Professional: choice-board builder for a client |
| `/professional/clients/[id]/breaks` | Professional: movement-break assignment for a client |
| `/professional/clients/[id]/lessons` | Professional: microlearning assignment for a client |
| `/professional/ceu` | CEU course catalog, filtered by the professional's discipline |
| `/professional/ceu/[courseId]` | CEU course player |
| `/professional/ceu/certificates` | "My CEU certificates" — lists earned certificates with CE credit totals |
| `/instructor/analytics` | Instructor analytics page — currently a static placeholder, no real data (see Section 11) |

**Requested-but-not-present roles/areas:**
- **Admin** — there is no `app/admin/*` route. A standalone `admin/courses/page.js` and `admin/users/page.js` exist in the repo, but they sit *outside* the `app/` directory, so Next.js App Router does not register them as routes. They are dead code, not a working admin dashboard (see Section 14).
- **Dedicated "student" pages** — students use the same `/dashboard`, `/courses`, `/courses/[id]`, `/quiz/[id]` pages as everyone else; there's no separate student-only route tree.
- **"Academy" as a dashboard area** — `/academy` is a marketing/landing page, not an authenticated dashboard.

## 6. Current API Endpoints

This list reflects only endpoints actually mounted in `app.js` — i.e., what the running server actually serves.

**Health / readiness (mounted at root, before `/api`)**
- `GET /__ping`, `GET /healthz`, `GET /api/health`, `GET /api/healthz`, `GET /readyz` — liveness/readiness checks
- `GET /` , `GET /readyz`, `GET /api/readyz` (via `readyRoutes`)

**Auth — `/api/auth`**
- `POST /api/auth/register` — create account, returns JWT
- `POST /api/auth/login` — authenticate, returns JWT
- `GET /api/auth/me` — return the authenticated user (requires auth)

**Users — `/api/users`**
- `GET /api/users/` — (no auth guard observed)
- `GET /api/users/me` — current user (requires auth)

**Courses — `/api/courses`** (all require auth)
- `GET /api/courses/` — list courses
- `GET /api/courses/:id` — get one course
- `POST /api/courses/` — create course
- `PUT /api/courses/:id` — update course
- `DELETE /api/courses/:id` — delete course

**Lessons — `/api/lessons`** (no auth guard observed on this route file)
- `GET /api/lessons/ping`, `GET /api/lessons/`, `GET /api/lessons/:id`, `POST /api/lessons/`, `PUT /api/lessons/:id`, `DELETE /api/lessons/:id`

**Quizzes — `/api/quizzes`**
- `GET /api/quizzes/` , `GET /api/quizzes/:id` — list/get (auth required)
- `POST /api/quizzes/`, `PUT /api/quizzes/:id`, `DELETE /api/quizzes/:id` — instructor/admin only
- `POST /api/quizzes/:id/submit` — submit answers (auth required)
- `GET /api/quizzes/:id/result` — get latest persisted result (auth required)

**Admin — `/api/admin`**
- `GET /api/admin/stats` — admin-only stats endpoint

**Audit — `/api/audit`**
- `GET /api/audit/flagged` — list flagged audit-log entries (auth required)

**Dev — `/api/dev`**
- `POST /api/dev/bootstrap-admin` — dev-mode-only admin bootstrap

**Seed — `/api/seed`**
- `POST /api/seed/apply` — apply seed data (guarded by `requireSeedBootstrap`)
- `GET /api/seed/status` — seed status

**Clients — `/api/clients`**
- Full CRUD: `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`

**Check-ins — `/api/checkins`**
- `GET /api/checkins/`, `POST /api/checkins/`

**Choice boards — `/api/boards`**
- Full CRUD: `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`

**Choice selections — `/api/choice-selections`**
- `GET /api/choice-selections/`, `POST /api/choice-selections/`

**Movement breaks — `/api/movement-breaks`**
- `GET /api/movement-breaks/`, `POST /api/movement-breaks/`

**Client movement breaks — `/api/client-breaks`**
- `GET /api/client-breaks/`, `POST /api/client-breaks/`, `DELETE /api/client-breaks/:id`

**Break logs — `/api/break-logs`**
- `GET /api/break-logs/`, `POST /api/break-logs/`

**CEU — `/api/ceu`**
- `GET /api/ceu/courses` — list CEU courses
- `GET /api/ceu/courses/:id/progress` — progress for a course
- `POST /api/ceu/courses/:id/complete` — mark course complete, issue certificate
- `POST /api/ceu/lessons/:lessonId/complete` — mark a lesson complete
- `GET /api/ceu/completions` — list the current user's completions/certificates

**Micro-lessons — `/api/micro-lessons`**
- `GET /api/micro-lessons/`, `POST /api/micro-lessons/`

**Client micro-lessons — `/api/client-lessons`**
- `GET /api/client-lessons/`, `POST /api/client-lessons/`, `DELETE /api/client-lessons/:id`

**Lesson completions — `/api/lesson-completions`**
- `GET /api/lesson-completions/`, `POST /api/lesson-completions/`

**Route files that exist on disk but are NOT mounted anywhere in `app.js` (dead/orphaned):**
- `routes/analyticsRoutes.js`
- `routes/dashboardRoutes.js`
- `routes/insightsRoutes.js`

These are real route files with handlers behind them, but since `app.js` never calls `app.use(...)` for them, hitting their paths in production returns a 404. There is also no `badgeRoutes.js` at all, even though `Badge` model and `badgeController`/`badgesController` controllers exist — badges have no API surface whatsoever.

## 7. Authentication Status

- **Login works**: yes — `POST /api/auth/login` checks email/password against `bcryptjs` hash, returns a signed JWT. Frontend `/login` page stores the token (`lib/auth.ts`, key `mc_token`) and redirects to `/dashboard`.
- **Registration works**: yes — `POST /api/auth/register` creates a `User` with a self-assigned role limited to `student`, `caregiver`, or `professional` (privileged roles `instructor`/`admin` cannot be self-assigned at signup, by design).
- **Protected routes work**: partially. `requireAuth` middleware correctly validates the `Authorization: Bearer <token>` header and attaches `req.user` for routes that use it (auth, courses, quizzes, admin, audit). However, several route files (`lessonRoutes.js`, `userRoutes.js` root listing, `clientRoutes.js`, `checkinRoutes.js`, `choiceBoardRoutes.js`, and others) do **not** apply `requireAuth` at all — meaning those endpoints are reachable without a token.
- **Roles that exist**: `student`, `instructor`, `admin`, `caregiver`, `professional` (defined in the `User` model's `enum`). `requireRole(...)` is used in only a few places (`/api/admin/stats`, quiz create/update/delete).
- **Known auth problems**:
  - In production, if `JWT_SECRET` is unset, the backend throws/returns `JWT_SECRET_MISSING` rather than silently using a dev fallback — this is correct behavior, but it means a missing env var in production fails closed (good), while in development it silently falls back to a hardcoded `dev_secret_change_me` (acceptable for local dev only).
  - There are two separate login UIs in the frontend: `/login` (the live, styled page wired into `SiteNav`) and `/auth` + `/auth/login` (an older, separate page tree). It's not confirmed whether `/auth/login` is still wired to a working submit handler or is leftover/dead.
  - Many CRUD endpoints (clients, check-ins, choice boards, movement breaks, micro-lessons) have no auth guard at all, which is a real security gap given they touch client/caregiver personal data.

## 8. Course System Status

- **Courses creatable**: yes via API (`POST /api/courses`, requires auth), but there's no working create-course UI — the only frontend file that attempts this (`admin/courses/page.js`) is not a live route (see Section 14).
- **Students can view courses**: yes — `/courses` lists all courses, `/courses/[courseId]` shows a course's lessons and any linked quizzes.
- **Modules/lessons exist**: yes — `Lesson` model with `courseId`, `title`, `description`, `videoUrl`, `order`, `isPublished`. Lessons are fetched separately from courses (`GET /api/lessons?courseId=...`) and matched client-side.
- **Lesson progress tracked**: partially — a `LessonProgress` model exists (`userId`, `lessonId`, `courseId`, `completedAt`) but no route file or controller calls were found wiring it up; it appears to be a model with no live API surface for general (non-CEU) courses. CEU-specific lesson completion (`/api/ceu/lessons/:id/complete`) is the one progress-tracking path that's actually wired end-to-end.
- **Overall status: partially complete.** Catalog browsing, lesson viewing, and quiz-taking work end-to-end for the general course flow. Course *authoring* (create/edit) has a backend API but no working UI. General lesson-progress tracking exists as a model but isn't connected to any endpoint that was found.

## 9. Quiz System Status

- **Quizzes exist**: yes — `Quiz` model (`courseId`, `lessonId`, `title`, `questions[]` with `prompt`/`choices`/`answerIndex`, `isPublished`).
- **Submission works**: yes — `/quiz/[quizId]` renders radio-button questions, submits an index-aligned `answers[]` array to `POST /api/quizzes/:id/submit`.
- **Scores saved**: yes — submission is persisted (the frontend reloads the last result via `GET /api/quizzes/:id/result` on mount, which would only work if the backend stores it).
- **Results display correctly**: yes for the current quiz flow (`/course/[id]` → `/quiz/[id]`). Per `AGENTS.md`, this was a known broken area that was already fixed: the URL prefix, request/response shape, and submit contract were all repaired in a prior pass.
- **Known quiz errors / leftover risk**: there are **three result-tracking models** in the backend — `QuizResult`, `Result`, and (implicitly) whatever `resultController.js`/`resultsController.js` (singular and plural duplicates) operate on. It was not confirmed which model is actually written to by `quizController.submit`, so there is a real risk of inconsistent/duplicate result storage that should be checked before building any reporting/analytics on top of quiz scores. The entire `app/quizzes/` (plural) route tree and its components were previously found to be dead, client-side-only, never-correctly-wired duplicate quiz code and were archived — the only live quiz flow is `app/quiz/[quizId]/page.jsx` (singular).

## 10. Certificates / Badges / Progress

- **Certificates**: implemented and working, but **only for the CEU pathway** — `CEUCompletion` model stores `certificateNumber`, `ceCredits`, `discipline`, `completedAt`; `/professional/ceu/certificates` renders them with a certificate-style card UI. There is no certificate mechanism for general (non-CEU) course completion.
- **Badges**: not implemented in any usable way. A `Badge` model and two controllers (`badgeController.js`, `badgesController.js`) exist in the backend, and a `badgeSync.js` utility exists in the frontend, but there is no mounted route for badges anywhere in `app.js`, and no frontend page references badges outside of the unrelated CSS class named `.badge` (a UI chip style, not the gamification feature). This is dead/orphaned scaffolding.
- **Streaks**: no streak model, field, or UI was found anywhere in either repo.
- **Completion tracking**: works for CEU courses (course-level and lesson-level completion endpoints exist and are wired to the CEU UI) and for the specialized caregiver/professional tools (movement-break logs, choice-board selections, micro-lesson completions all have matching models + endpoints + UI). General course/lesson completion (outside CEU) has a `LessonProgress` model but no confirmed live endpoint.
- **Progress dashboard**: there is no dedicated progress/analytics dashboard for students. `/instructor/analytics` exists as a page but is a static placeholder with no real data (see Section 11).

## 11. Dashboard Status

- **`/dashboard` (all roles)**: works — checks auth, calls `GET /api/auth/me` to confirm the session, and conditionally renders role-specific cards (caregiver: check-in, choice boards, movement breaks, microlearning; professional: client roster, CEU courses). Has a "Browse courses" link and a basic account-check status readout.
- **Student dashboard**: functionally just the generic `/dashboard` view with a "Browse courses" link — there's no student-specific dashboard section beyond what every authenticated user sees.
- **Instructor dashboard**: `/instructor/analytics` exists but is an explicit placeholder ("Replace this with charts and KPIs once the data layer is ready") with no live data, no charts, no KPIs. Incomplete.
- **Admin dashboard**: does not exist as a live route. The files that look like an admin dashboard (`admin/courses/page.js`, `admin/users/page.js`) live outside `app/` and are not served by Next.js. They also use a different auth-token read pattern (`localStorage.getItem('token')`) than the rest of the app (`mc_token` via `lib/auth.ts`), confirming they're stale/disconnected from the current auth system. There is a backend `GET /api/admin/stats` endpoint with no frontend consumer.
- **Professional portal** (`/professional` and sub-routes): works — client roster, per-client choice boards/breaks/lessons, CEU catalog and certificates are all wired end-to-end.
- **Caregiver portal** (`/caregiver` and sub-routes): works — mood check-in, choice-board player, movement-break player, microlearning swipe player are all wired end-to-end.

## 12. Database / Models

All models live in `microcourse-backend-final-clean/models/`.

| Model | Stores |
|---|---|
| `User` | Account record: email, password hash, name, role (`student`/`instructor`/`admin`/`caregiver`/`professional`), discipline (SLP/OT/PT/Behaviorist/Psychologist/Other) |
| `Course` | Course metadata: title, description, category, level, published flag, CEU flag |
| `Lesson` | A lesson within a course: title, description, video URL, order, published flag |
| `LessonProgress` | A user's completion of a lesson (exists as a model; no confirmed live endpoint — see Section 8) |
| `Quiz` | A quiz tied to a course/lesson: title, embedded questions (prompt, choices, correct-answer index), published flag |
| `QuizResult` | A persisted quiz attempt: score, max score, percent, correct count, answers, pass/fail |
| `Result` | A second, overlapping quiz-attempt record (score, total, correct count, answers, attempt key) — duplicate-looking schema, relationship to `QuizResult` not confirmed |
| `Client` | A therapy client managed by a professional: name, discipline, linked caregiver (by ID or email), notes, active flag |
| `MoodCheckIn` | A caregiver-recorded mood/regulation check-in for a client: zone (blue/green/yellow/red), energy, pleasantness, label, note |
| `ChoiceBoard` | A visual choice board assigned to a client: title, board type (choices/first-then/feelings/schedule), embedded choice items |
| `ChoiceSelection` | A recorded tap/selection a client made on a choice board |
| `MovementBreak` | A guided movement/sensory break template: category, icon, duration, ordered instruction steps |
| `ClientMovementBreak` | Assignment of a movement break to a specific client |
| `BreakLog` | A recorded completion of a movement break by a client |
| `MicroLesson` | A short swipe-card lesson: topic, icon, embedded cards (info or quiz-style) |
| `ClientMicroLesson` | Assignment of a micro-lesson to a specific client |
| `MicroLessonCompletion` | A recorded completion of a micro-lesson by a client, with quiz-card correct count |
| `CEUCompletion` | A completed CEU course: user, course, discipline, CE credits, unique certificate number, completion date |
| `Badge` | A gamification badge definition (key, name, description, points) — model exists with no live route or frontend consumer (orphaned, see Section 10) |
| `Notification` | A user notification: type, message, read flag, arbitrary metadata |
| `Insight` | An AI/analytics-style summary tied to a user email + course (`summary`, freeform `insights` object) — no confirmed route wiring it up |
| `AuditLog` | A logged action (e.g. quiz submission, flagged event) with flagged/resolved state — backs the `/api/audit/flagged` endpoint |

## 13. Recent Changes Made by Claude

Most recent work, in order:

1. **Full QA pass** — removed a dead `/devtools-test` page; confirmed all backend route files resolve and all frontend nav/dashboard/portal pages call real, working backend endpoints.
2. **MicroCourse → LexiMind Academy rebrand (public-facing only)**:
   - `app/layout.tsx` — page title/meta description updated
   - `components/SiteNav.tsx` — brand text/aria-label updated, new "Academy" nav link added
   - `app/page.tsx` — homepage eyebrow, hero subcopy, and secondary CTA updated to reference LexiMind Academy and link to `/academy`
   - `app/login/page.tsx` — eyebrow text updated
   - `app/register/page.js` — eyebrow text updated
   - `app/academy/page.tsx` — **new file**, full Academy landing page (hero, 8-discipline "What You Can Learn" grid, 7-format "Learning Formats" grid including "MicroCourses," a featured-course card for "Rehab Revenue Engine," and a Marketplace cross-link section)
   - No routes, API paths, database collections, model names, or environment variables were touched. No `/microcourse` route existed to redirect, so no redirect was added.
3. **Rebrand reference audit** — a full repo-wide search for every remaining MicroCourse/microcourse-style string in both repos, categorized by risk and urgency, delivered as a standalone report (`rebrand-audit.md`) with no code changes made, per explicit instruction to audit only.
4. **This report** — `LEXIMIND_ACADEMY_PROJECT_STATUS.md` (this file), compiled by reading the current state of both repos directly.

## 14. Known Errors or Broken Areas

- **Three orphaned backend route files**: `routes/analyticsRoutes.js`, `routes/dashboardRoutes.js`, `routes/insightsRoutes.js` exist with real handlers but are never `app.use()`'d in `app.js`. Any frontend code expecting these to work would silently get 404s.
- **No admin dashboard route**: `admin/courses/page.js` and `admin/users/page.js` live outside `app/`, so Next.js never serves them as pages. They also read the auth token via `localStorage.getItem('token')` instead of the app's real token key (`mc_token`), confirming they're disconnected leftovers, not a working admin UI.
- **Badges are fully orphaned**: `Badge` model + `badgeController.js`/`badgesController.js` + frontend `badgeSync.js` exist, but there is no mounted `badgeRoutes.js` at all — zero working API surface, zero UI.
- **Duplicate/competing controllers in the backend `controllers/` folder** (singular vs. plural pairs that suggest unfinished cleanup or parallel implementations): `badgeController.js`/`badgesController.js`, `insightController.js`/`insightsController.js`, `notificationController.js`/`notificationsController.js`, `quizController.js`/`quizzesController.js`, `resultController.js`/`resultsController.js`. Plus two explicit stub/placeholder files: `_notImplemented.js` and `_stubs.js`. It was not confirmed which of each duplicate pair (if any) is actually wired to a live route.
- **Two overlapping quiz-result models**: `QuizResult` and `Result` both appear to store quiz attempt data with overlapping fields. Which one the live `/api/quizzes/:id/submit` endpoint actually writes to was not confirmed in this pass — worth checking before building any reporting on top of quiz history.
- **Inconsistent auth guarding**: several CRUD route files (`lessonRoutes.js` for write operations, `userRoutes.js` root listing, `clientRoutes.js`, `checkinRoutes.js`, `choiceBoardRoutes.js`, `choiceSelectionRoutes.js`, `movementBreakRoutes.js`, `clientMovementBreakRoutes.js`, `breakLogRoutes.js`, `microLessonRoutes.js`, `clientMicroLessonRoutes.js`, `lessonCompletionRoutes.js`) do not apply `requireAuth`, meaning they're reachable by anyone with the URL — notably concerning since several of these touch client/caregiver personal data (mood check-ins, client records).
- **Two parallel login page trees**: `/login` (live, styled, wired into nav) and `/auth` + `/auth/login` (older tree, status unconfirmed — may be dead).
- **Two parallel frontend API client implementations**: `lib/http.ts` and `lib/api.ts` both exist and are both actively imported by different pages/components, rather than the app standardizing on one. Not currently causing visible bugs, but a maintenance/consistency risk.
- **`LessonProgress` and `Insight` models appear to have no live route wiring** — they exist in the schema but nothing found in `routes/` or `app.js` exposes them.
- **Instructor analytics is a non-functional placeholder** — `/instructor/analytics` renders static placeholder text, no real charts/KPIs/data.
- **A previously-fixed but worth-knowing incident** (documented in `AGENTS.md`): a prior cleanup pass once stripped `package.json` down to 3 packages, breaking the build entirely, and `.gitignore` was once saved as UTF-16 so none of its rules (including `.env`) were honored by git, leading to a real MongoDB Atlas credential being committed and later removed. Both were fixed, but the `AGENTS.md` notes are kept as a warning for future cleanup passes to re-check `package.json` against real imports and to verify `.gitignore` encoding with `cat -A`/`file`, not just by eye.
- **A separate, unrelated `speech-assess-api/` sub-app** lives inside the frontend repo with its own `package.json`/`server.js` — its relationship to the rest of the app (is it deployed, is it called from anywhere) was not investigated in this pass.

## 15. Testing Status

- **Backend**: a real Jest test suite exists (`tests/`, ~30 files) covering auth, courses, lessons, quizzes, health/readiness contracts, middleware, and OpenAPI contract checks, runnable via `npm test` (`jest --runInBand`). Whether all tests currently pass was not verified in this pass — running the suite live is recommended as a next step rather than assumed from file presence alone.
- **Frontend**: Jest config (`jest.config.cjs`, `jest.setup.ts`/`.js`) and a small `__tests__/` folder (`api.test.ts`, `app_dashboard_page.test.jsx`) exist. Playwright is also configured (`playwright.config.ts`, `tests/e2e/*.spec.ts`, a `playwright-report/` and `test-results/` folder from past runs), plus a separate `e2e/*.mjs` script-based suite (`courses.e2e.mjs`, `onboarding.e2e.mjs`, `student-course-quiz.e2e.mjs`).
- **API contract/smoke testing**: extensive Postman/Newman tooling exists in the backend repo (multiple `.postman_collection.json` files, `scripts/newman*.ps1`, scheduled-task `.bat` files for hourly/daily auth monitoring, and historical `logs/newman-*.log` files spanning months) — this represents real, if sprawling, QA infrastructure built up over time, separate from the Jest suite.
- **Manual testing already completed** (per earlier work in this engagement, not re-verified in this pass): backend route resolution confirmed, frontend nav/dashboard/portal pages confirmed to call real backend endpoints, and the rebranded pages were confirmed to use only existing CSS classes (no visual breakage from the rebrand).
- **Net assessment**: testing infrastructure is unusually mature for a project at this stage (Jest + Playwright + Newman, all present), but actual current pass/fail status of any of these suites was not executed/observed live in this session and should be treated as unverified rather than assumed-passing.

## 16. Deployment Status

- **Frontend**: deployed to Vercel (per `AGENTS.md` and `.env.example` comments referencing setting `NEXT_PUBLIC_API_BASE` on Vercel). No `vercel.json` is committed to the repo, so build/deploy settings are presumably configured directly in the Vercel project dashboard, not in code.
- **Backend**: deployed to Render (per `.env.example` comments referencing Render-specific bootstrap-seed behavior). No `render.yaml` is committed, so similarly configured via the Render dashboard.
- **Database**: MongoDB Atlas (per `AGENTS.md`).
- **Live round-trip between the deployed Vercel frontend and deployed Render backend was previously confirmed working** in an earlier phase of this engagement (login, dashboard, course data round trip). This was not re-verified in this session — current live status should be spot-checked before treating it as still-working, especially since a `git push` failure (local network/DNS issue, not a code problem) was observed earlier in this session, meaning there may be local commits not yet pushed/deployed.
- **Deployment errors**: none currently known/reported in this session beyond the local `git push` DNS resolution failure mentioned above (a local machine networking issue, unrelated to the app or hosting providers).

## 17. Rebrand Recommendation

**Safe to change now** (no functional/URL/data risk):
- Remaining internal dev-doc headers (`AGENTS.md`, `README.md`, `README_FRONTEND.md`) that still say "MicroCourse" — cosmetic only, never shipped to users.
- `.env.example` placeholder value `NEXT_PUBLIC_APP_NAME=MicroCourse` → `LexiMind Academy` (the variable itself isn't read anywhere live today, so this is zero-risk).
- All OpenAPI spec titles (`docs/openapi.yaml`/`.json`/`.yml`, `openapi.js`, `tools/openapi.json`) and Postman collection/environment `name`/`description` fields — pure documentation metadata with no functional dependency.
- `public/api-docs.html` `<title>` and body copy — a real served page, but low-risk, isolated cosmetic update.
- The hyphenation inconsistency "micro-courses" vs. "microcourses" in `app/dashboard/page.tsx` and `app/professional/ceu/page.tsx` — trivial copy-consistency fix.

**Should wait until later** (real but low-urgency, needs a coordinated pass):
- The seeded onboarding course title/slug in `seed-onboarding.ps1` ("MicroCourse Forge...") — the title is real catalog content worth rebranding, but the **slug** is a URL; changing it without an alias/redirect breaks any bookmarked link. Do this as one deliberate, separate change.
- The `service: "microcourse-backend"` string returned by health-check endpoints (`healthController.js`, `readyRoutes.js`) and the matching frontend `server.js`/`speech-assess-api/server.js` log lines — functional identifiers some monitoring/QA tooling may key off of; rename all matching locations together, not piecemeal.
- Consolidating the 8 near-duplicate OpenAPI spec files and ~20 near-duplicate Postman collection files into fewer canonical files — not urgent, but worth doing alongside any rebrand-metadata pass since you're already touching these files.

**Risky to change now** (high blast radius relative to benefit, needs its own planned task):
- The MongoDB database name default (`microcourse`) used by `storage.js`/seed scripts — explicitly out of scope per the original rebrand instructions ("no database-breaking rename"). Do not touch without a full migration plan.
- The two repos' npm package names (`microcourse-frontend`, `microcourse-backend`) and the PM2 process name (`microcourse-api`) — renaming touches lockfiles, CI, and ops commands (`pm2 restart ...`).
- The repo folder names themselves and the Windows Scheduled Task names for Newman monitoring — filesystem/ops-level changes, not code changes; renaming casually will break local paths and scheduled jobs referencing the old names.
- JSON Schema `$id` values in `Scaffold-Schemas.ps1` referencing `https://microcourse.ai/schemas/...` — these are meant to be stable identifiers; treat as a deliberate versioning decision if the domain is ever retired.

## 18. Next 10 Recommended Steps

1. Confirm whether `/api/quizzes/:id/submit` writes to `QuizResult` or `Result` (or both) — resolve the duplicate-model ambiguity before building any quiz reporting/analytics.
2. Run the existing Jest suite (`npm test` in the backend) and the frontend's Jest/Playwright suites to get a real current pass/fail baseline rather than relying on file presence alone.
3. Add `requireAuth` (and `requireRole` where appropriate) to the currently-unguarded CRUD routes — especially `clientRoutes.js`, `checkinRoutes.js`, and the choice-board/movement-break/micro-lesson routes, since these touch client/caregiver personal data.
4. Decide the fate of `routes/analyticsRoutes.js`, `routes/dashboardRoutes.js`, and `routes/insightsRoutes.js` — either mount them if they're needed, or delete them if they're truly dead, rather than leaving working code unreachable.
5. Decide whether to build a real admin dashboard under `app/admin/*` (wired to the existing `GET /api/admin/stats` endpoint and real auth) or remove the disconnected `admin/courses/page.js`/`admin/users/page.js` files entirely to stop them from confusing future contributors.
6. Either wire up the orphaned `Badge` model/controllers with a real route and UI, or remove them — right now it's pure dead weight with zero functionality.
7. Replace the `/instructor/analytics` placeholder with real data once there's a clear idea of what KPIs instructors need to see.
8. Resolve the two parallel login trees (`/login` vs `/auth`/`/auth/login`) — confirm which is canonical and remove or redirect the other to avoid user/dev confusion.
9. Standardize on one frontend API client (`lib/http.ts` or `lib/api.ts`) instead of maintaining two parallel implementations long-term.
10. Re-verify the live Vercel↔Render round trip (login, course load, quiz submit) now that local commits may be pending a `git push` (a DNS/network issue was seen locally earlier and should be confirmed resolved before assuming the deployed app reflects the latest code).

## 19. Files ChatGPT Should Review First

- `microcourse-frontend/package.json` and `microcourse-backend-final-clean/package.json` — dependencies, scripts, confirms tech stack
- `microcourse-frontend/app/layout.tsx` — root layout, app-wide metadata/branding
- `microcourse-frontend/components/SiteNav.tsx` — nav structure, brand text, role-aware links
- `microcourse-frontend/app/dashboard/page.tsx` — role-based dashboard logic
- `microcourse-frontend/app/courses/page.tsx`, `app/courses/[courseId]/page.tsx`, `components/CoursesClient.tsx`, `components/CourseDetailsClient.tsx` — course catalog/detail flow
- `microcourse-frontend/app/quiz/[quizId]/page.jsx` — the live quiz flow
- `microcourse-frontend/app/academy/page.tsx` — the new brand landing page
- `microcourse-frontend/lib/auth.ts`, `lib/http.ts`, `lib/api.ts` — auth token handling and the two parallel API clients
- `microcourse-backend-final-clean/app.js` — the definitive list of what's actually mounted/live on the backend
- `microcourse-backend-final-clean/server.js` — boot sequence, DB connection
- `microcourse-backend-final-clean/controllers/authController.js` and `middleware/requireAuth.js`, `middleware/requireRole.js` — auth implementation
- `microcourse-backend-final-clean/controllers/courseController.js`, `controllers/quizController.js` — core course/quiz logic
- `microcourse-backend-final-clean/models/User.js`, `Course.js`, `Lesson.js`, `Quiz.js`, `QuizResult.js`, `Result.js` — core data model, including the unresolved duplicate-result-model question
- `microcourse-backend-final-clean/models/CEUCompletion.js` and `controllers/ceuController.js` (referenced by `routes/ceuRoutes.js`) — the one fully-working certificate/completion pathway
- `microcourse-backend-final-clean/.env.example` — shows required environment variables and their purpose (no real values/secrets)
- `microcourse-frontend/.env.example` — same, for the frontend
- `microcourse-frontend/AGENTS.md` — accumulated tribal knowledge about past incidents, fixes, and what's "real" vs. dead code in this repo

---

## Plain-English Summary

**What is working:** Account registration and login with role assignment (student/caregiver/professional, self-assigned; instructor/admin are privileged-only); the general course catalog and course-detail pages with expandable lesson answers; the full quiz-taking flow (load quiz → answer → submit → see saved score, including across refreshes); the CEU continuing-education pathway end-to-end, including a working certificates page; and all four of the specialized caregiver/professional tools — mood check-ins, choice boards, movement breaks, and microlearning swipe-lessons — each with a real backend model, API, and matching UI on both the professional (assign) and caregiver (use) side. The public-facing rebrand to "LexiMind Academy" is also complete and live across the nav, homepage, login/register, and the new `/academy` page.

**What is partially working:** general (non-CEU) course/lesson progress tracking has a database model but no confirmed live API wiring it up; course creation has a backend API but no usable creation UI; and there are two competing quiz-result models (`QuizResult` and `Result`) whose actual relationship to the live submit flow needs to be confirmed before building anything on top of quiz history.

**What is not working:** there is no functioning admin dashboard (the files that look like one aren't even part of the live route tree, and use a different, outdated auth pattern); the badge/gamification feature is fully orphaned scaffolding with zero working API or UI; three backend route files (analytics, dashboard, insights) exist but are never mounted, so they 404 if anything calls them; instructor analytics is a static placeholder with no real data; and a number of write-capable endpoints touching client/caregiver personal data have no auth guard at all.

**What should be done next:** resolve the duplicate quiz-result-model question, run the existing (fairly mature) test suites to get a real pass/fail baseline, lock down the unguarded endpoints, and then make a deliberate decision — per route/feature — about whether to finish (admin dashboard, badges, instructor analytics, orphaned routes) or formally remove each unfinished/dead area, rather than leaving them as ambiguous half-built scaffolding.
