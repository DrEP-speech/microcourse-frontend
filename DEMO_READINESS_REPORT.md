# LexiMind Academy — Demo Readiness & Pre-Launch Hardening Report

**Date:** 2026-06-30
**Scope:** `microcourse-frontend` (Vercel) + `microcourse-backend-final-clean` (Render) + MongoDB Atlas
**Status basis:** Backend stabilization commit complete, backend test suite passing, frontend production build passing, live deployment verified end-to-end (registration, login, token storage, lesson routes, quiz Q&A, quiz result reload all confirmed working on the deployed Vercel + Render URLs).

This report does not propose new features, renames, or restructuring. It is a read of current state plus a prioritized hardening path.

---

## 1. Current Demo-Ready Features

The following are verified working today, live, on the deployed stack — safe to demonstrate without caveats:

- Account registration (`/register`) — posts to `POST /api/auth/register`, receives a JWT, stores it under the `mc_token` key, redirects to `/dashboard`.
- Login (`/login`) — posts to `POST /api/auth/login`, same token contract, redirects to `/courses`.
- Token persistence — `mc_token` is read/written consistently across `lib/api.ts`, `lib/auth.ts`, and `lib/http.ts`; refreshing the page does not lose the session.
- Dashboard, course list, and course detail pages — load and render against live backend data.
- Quiz flow — load a quiz, answer questions, submit (`POST /api/quizzes/:id/submit`), see a pass/fail score, and on page refresh the last saved result reloads (`GET /api/quizzes/:id/result`).
- Caregiver portal (`/caregiver`, plus boards/breaks/lessons sub-pages) — loads against `/api/clients` and related endpoints.
- Professional portal (`/professional`, plus client detail/boards/breaks/lessons sub-pages) — loads against the same client-data endpoints with professional-side views.
- CEU course catalog (`/professional/ceu`) and CEU course detail (`/professional/ceu/[courseId]`) — load live.
- CEU certificates view (`/professional/ceu/certificates`) — loads against `/api/ceu/completions`.
- LexiMind Academy branding page (`/academy`) and homepage (`/`) — consistent "LexiMind Academy" product branding, with "microcourses" used only as a learning-format term, not a product name.
- Backend write-protection — lesson and quiz create/update/delete routes require authentication and the correct role (`professional`, `instructor`, or `admin`); reads require authentication only.

## 2. Demo Script

A straight-line walkthrough, in order:

1. **Homepage** (`/`) — show the LexiMind Academy hero and positioning copy.
2. **LexiMind Academy page** (`/academy`) — show the format breakdown (full courses vs. microcourses) and brand framing.
3. **Registration** (`/register`) — create a fresh demo account live, on camera. Show the token-stored confirmation and redirect to `/dashboard`.
4. **Login** (`/login`) — log out (or open a private window) and log back in with the same account to show the login path independently.
5. **Dashboard** (`/dashboard`) — land here post-login.
6. **Courses** (`/courses`) — show the course catalog.
7. **Course detail** (`/courses/[courseId]`) — open one course, show lessons and the linked quiz.
8. **Quiz** (`/quiz/[quizId]`) — answer questions, submit.
9. **Quiz result** — show the score badge appear after submit, then refresh the browser tab to prove the result reloads from the backend rather than resetting.
10. **Caregiver portal** (`/caregiver`) — switch context, show a caregiver-facing view (mood check-in / boards / breaks / lessons).
11. **Professional portal** (`/professional`) — show the professional-facing client list and detail views.
12. **CEU page** (`/professional/ceu`) — show the CEU course catalog and open one course.
13. **Certificate page** (`/professional/ceu/certificates`) — show a completed CEU course's certificate record.

Recommended framing for the audience: this is a working learning platform with real auth, real persistence, and a working quiz/result loop — not a static mockup.

## 3. Known Demo Limitations

Do not promise or imply these are finished. If asked directly, say they are planned/future work:

- **Admin dashboard** — a backend endpoint exists (`GET /api/admin/stats`, admin-role-gated), but there is no frontend admin UI to demo.
- **Instructor analytics** — `app/instructor/analytics/page.jsx` exists in the frontend route table but has not been verified as a finished, data-complete feature; do not present it as production-ready.
- **Badges** — no badge/achievement system exists in the data model or UI.
- **Production CEU accreditation** — the CEU course/certificate flow is functional in this app, but there is no integration with an actual accrediting body; certificates generated here are not accredited continuing-education credit until that relationship exists.
- **Payments** — no payment processor, checkout flow, or billing model exists anywhere in the codebase.
- **Marketplace integration** — "LexiMind Marketplace" is referenced in copy on the academy page as positioning language only; no marketplace functionality (listings, transactions, third-party content) exists.
- **Real user onboarding** — there is no onboarding sequence, email verification, password reset, or welcome flow beyond the bare register/login forms.
- **HIPAA/compliance readiness** — the caregiver/professional portals handle client names and check-in data. Nothing in this codebase has been built or reviewed against HIPAA, FERPA, or any compliance framework. Treat all client data in the current system as non-compliant for real protected health information until a dedicated compliance review is done.

## 4. Production Blockers

These must be addressed before onboarding real (non-demo) users:

1. No rate limiting is active (see Security Checklist) — registration/login endpoints are open to brute-force and credential-stuffing today.
2. No automated test coverage for the frontend (no `test` script exists in `package.json` at all).
3. `npm audit` reports 11 vulnerabilities (2 moderate, 7 high, 2 critical) in frontend dependencies — unreviewed.
4. Course/quiz write endpoints (`POST/PUT/DELETE /api/courses`) require authentication but not role-checking — any authenticated user, including a student-role account, can currently create/edit/delete courses via direct API calls. Lesson and quiz writes already correctly require `professional`/`instructor`/`admin`; courses does not match that pattern.
5. The global error handler returns raw `err.message` to API clients (`app.js`), which can leak internal error detail to end users in production.
6. No password reset, account recovery, or email verification flow exists — a locked-out real user has no self-service path.
7. No formal data-handling/compliance review for caregiver and client check-in data.
8. No real CEU accreditation relationship — certificates are not legally accredited credit.
9. CORS origin configuration is environment-variable-driven and was found misconfigured once already during this verification pass (fixed) — needs a documented, repeatable process so it doesn't silently break on future deploys.
10. No monitoring/alerting (uptime, error rate, failed-login spikes) — the team would not know about an outage or attack in progress.

## 5. Security Checklist

| Item | Status | Detail |
|---|---|---|
| Auth guards | ✅ In place | `requireAuth` middleware verifies a `Bearer` JWT on protected routes; correctly refuses to fall back to a dev secret when `NODE_ENV=production` and `JWT_SECRET` is unset (returns 500 instead of silently trusting an insecure default). |
| Role guards | ⚠️ Partial | `requireRole` is correctly applied to lesson and quiz write routes (`professional`/`instructor`/`admin` only) and to the admin stats route (`admin` only). **Gap:** `courseRoutes.js` write endpoints (create/update/delete) require auth but not role — any logged-in user can currently write courses via the API. |
| Protected client/caregiver data | ⚠️ Needs review | Client/caregiver endpoints sit behind `requireAuth`, but ownership/scoping (e.g., can professional A see professional B's clients?) was not part of this verification pass and should be explicitly tested before real client data is entered. |
| CORS | ✅ Working, fragile | Driven by `CORS_ORIGIN` env var; defaults to deny-all in production if unset (safe default), allow-all in non-production (expected for local dev). Already had to be corrected once for the live Vercel origin — recommend documenting the exact allowed-origins list per environment so this doesn't regress on future frontend redeploys. |
| Environment variables | ✅ Handled correctly | `.env*` files are gitignored in both repos (verified); secrets are not committed to source control. |
| JWT secret | ✅ Set via env, not hardcoded | `JWT_SECRET` is read from environment; a hardcoded fallback exists only for non-production (`dev_secret_change_me`), explicitly disabled in production. |
| Database credentials | ✅ Env-driven | `MONGO_URI` is read from environment, not hardcoded in source. |
| Rate limiting | ❌ Not enabled | `express-rate-limit` is listed as a dependency in `package.json` but is **not wired into `app.js` or any route** — installed but unused. Registration, login, and all other endpoints currently have no request-rate protection. |
| Audit logging | ⚠️ Partial | A persistent, MongoDB-backed audit log exists (`AuditLog` model, `auditController`, flagged-event workflow with CSV export at `GET /api/audit/flagged`). A separate lightweight console-only `audit()` helper (`utils/audit.js`) also exists for ad hoc event logging. Coverage of which actions actually call either of these was not fully mapped in this pass — recommend confirming login attempts, registrations, and role-gated writes are all captured. |
| Error logging | ⚠️ Minimal | The global error handler in `app.js` returns a stable JSON shape but passes `err.message` straight through to the client and does not appear to log server-side beyond default process output — no centralized error-tracking service (e.g., Sentry) is wired in. |

## 6. Deployment Checklist

| Item | Status | Detail |
|---|---|---|
| Vercel frontend | ✅ Deployed | Live at `microcourse-frontend.vercel.app` (stable production domain) plus deploy-specific preview URLs. |
| Render backend | ✅ Deployed | Live at the `microcourse-backend-final-clean` Render service, confirmed listening and reachable. |
| MongoDB Atlas | ✅ Connected | Backend `.env` points to an Atlas cluster; live registration/login round-trips confirm connectivity. |
| Environment variables | ✅ Set, but undocumented | Confirmed present and functioning on both platforms; no single source-of-truth document exists listing required vars per environment (recommend creating one, without secret values, for onboarding future contributors). |
| Custom domain | ❌ Not set up | App is currently served from default Vercel/Render subdomains, not a branded custom domain. |
| SSL | ✅ Default | Both Vercel and Render provide automatic HTTPS on their default domains; no action needed unless a custom domain is added (which would need its own cert, typically automatic via either platform). |
| CORS allowed origins | ⚠️ Single-origin, recently fixed | Currently set to one Vercel origin. Recommend setting it to the stable production domain (not a deploy-specific preview hash) and adding any additional origins (e.g., a custom domain, once added) as a comma-separated list — `app.js` already supports this. |
| Health checks | ✅ Present | A `readyRoutes` health endpoint is mounted at the app root; suitable for platform-level uptime checks, though no external monitoring is currently configured to call it. |

## 7. Brand Cleanup Checklist

| Item | Status | Detail |
|---|---|---|
| LexiMind Academy public-facing brand | ✅ Consistent | Verified across `app/layout.tsx`, `app/academy/page.tsx`, `app/page.tsx`, and `components/SiteNav.tsx` — "LexiMind Academy" is the product name everywhere user-facing. |
| Old MicroCourse references safe to leave internally | ✅ Identified | Package names (`microcourse-frontend`, `microcourse-backend`), API route prefixes (`/api/...`), database name (`microcourse`), and internal identifiers all still say "MicroCourse" — this is intentional and explicitly out of scope to rename per standing constraints. These are invisible to end users. |
| Custom domain recommendation | Recommended | Acquire a domain matching the LexiMind Academy brand (e.g. `leximindacademy.com`) and point it at the Vercel frontend; update `CORS_ORIGIN` on Render to include it once live. |
| Future route redirect strategy | Already partially in place | A `/microcourse` → `/academy` redirect already exists (added previously, non-destructively). If a custom domain is added later, no further redirect work is strictly required unless old marketing links to the current Vercel subdomain need to be preserved — in that case, a simple domain-level redirect (configured in Vercel) is sufficient; no application code changes needed.

## 8. Next 10 Tasks Before Beta Launch

In priority order:

1. Add role-gating to `courseRoutes.js` write endpoints to match the pattern already used for lessons/quizzes (auth + role, not auth alone).
2. Wire up the already-installed `express-rate-limit` package on at least `/api/auth/login` and `/api/auth/register` to stop brute-force/credential-stuffing.
3. Review and resolve the 11 `npm audit` vulnerabilities in the frontend (2 critical, 7 high, 2 moderate).
4. Sanitize the global error handler so raw internal error messages are not returned to API clients; log full detail server-side instead.
5. Add a real frontend test suite (currently no `test` script exists at all) covering at minimum register/login/quiz-submit.
6. Document required environment variables per environment (frontend and backend) in a single reference file, without secret values, to prevent future CORS/config regressions like the one fixed this session.
7. Add password reset / account recovery flow — currently no self-service path exists for a locked-out user.
8. Confirm data-scoping on caregiver/professional/client endpoints (can one professional see another's clients?) before any real client data is entered.
9. Stand up basic uptime/error monitoring (even a simple external ping against the health-check route, plus a hosted error tracker) so outages and failed-login spikes are visible.
10. Decide and document the compliance posture for client/caregiver check-in data (HIPAA/FERPA or explicit "not for real PHI" disclaimer) before any real caregiver or client uses the product with real personal data.

## 9. Final Recommendation

**Demo-ready: Yes.**
The application can be confidently demoed today. Registration, login, token handling, the course/quiz/result loop, and the caregiver/professional/CEU portals all work end-to-end on the live deployment, with consistent LexiMind Academy branding throughout.

**Beta-ready: No, not yet.**
Beta implies real (even if limited) external users entering real data. Rate limiting is not active, course-write endpoints are under-permissioned, there is no test coverage on the frontend, and dependency vulnerabilities are unreviewed. These are addressable in the near term (see Section 8) but are not done today.

**Production-ready: No.**
Beyond the beta gaps, there is no payments capability, no real CEU accreditation, no compliance review for client/caregiver health-adjacent data, and no monitoring or incident-response posture. None of this should be promised to real users or stakeholders as "production" until the production blockers in Section 4 are explicitly closed.
