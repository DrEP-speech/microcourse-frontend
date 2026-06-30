# Frontend Beta Hardening Sprint 2 — Phase 2 Report

**Date:** 2026-06-30
**Scope:** `microcourse-frontend` only. Phase 2 implementation.
**Commit status:** Not committed — awaiting your approval.

---

## 1. Files Changed

| File | Change |
|---|---|
| `package.json` | Added `"test": "jest --runInBand"` and `"e2e": "playwright test"` scripts |
| `jest.config.cjs` | Fixed broken `moduleNameMapper`: `"<rootDir>/"` → `"<rootDir>/$1"` |
| `__tests__/api.test.ts` | Fixed import (`apiRequest` → `apiFetch`), fixed fetch mock to include `headers`, fixed env var name (`NEXT_PUBLIC_API_BASE_URL` → `NEXT_PUBLIC_API_BASE`), fixed error assertion to match real `ApiError` shape (`{ status, message }` instead of `{ status, code }`) |
| `__tests__/app_dashboard_page.test.jsx` | Replaced broken `DashboardClient` test (component doesn't exist) with 4 real tests of `SiteNav` — renders brand link, navigation landmark, Sign in / Get started links when unauthenticated, and absence of Logout button when unauthenticated |

---

## 2. Dependency Changes

### What was applied

None — the npm registry is fully blocked by this sandbox's network allowlist (HTTP 403 on all `registry.npmjs.org` tarball downloads). Neither `npm install next@14.2.35` nor the test package installs could execute here.

### What you must run locally

```bash
# Step 1: Upgrade Next.js within the 14.x line (CVE fix)
npm install next@14.2.35 eslint-config-next@14.2.35

# Step 2: Install test packages
npm install --save-dev \
  jest@29 \
  jest-environment-jsdom \
  @testing-library/react@14 \
  @testing-library/jest-dom@6 \
  @testing-library/user-event@14 \
  babel-jest \
  identity-obj-proxy \
  @playwright/test

# Step 3: Install Playwright browsers
npx playwright install chromium
```

### Current installed versions (unchanged from Phase 1)

| Package | Installed |
|---|---|
| next | 14.1.0 (pending upgrade to 14.2.35) |
| eslint-config-next | 14.1.0 (pending upgrade to 14.2.35) |
| react / react-dom | 18.2.0 |
| axios | 1.18.1 |
| jspdf | 2.5.2 |
| mongoose | 8.24.1 |

---

## 3. package.json Script Changes

Before:
```json
"scripts": {
  "dev": "next dev -p 3000",
  "build": "next build",
  "start": "next start -p 3000",
  "lint": "next lint",
  "typecheck": "tsc -p tsconfig.json --noEmit"
}
```

After:
```json
"scripts": {
  "dev": "next dev -p 3000",
  "build": "next build",
  "start": "next start -p 3000",
  "lint": "next lint",
  "typecheck": "tsc -p tsconfig.json --noEmit",
  "test": "jest --runInBand",
  "e2e": "playwright test"
}
```

---

## 4. jest.config.cjs Change

Before (broken — every `@/something` import resolved to the repo root directory):
```js
"^@/(.*)$": "<rootDir>/",
```

After (correct — `@/lib/auth` → `<rootDir>/lib/auth`, `@/components/SiteNav` → `<rootDir>/components/SiteNav`, etc.):
```js
"^@/(.*)$": "<rootDir>/$1",
```

---

## 5. __tests__/api.test.ts Changes

The real export from `lib/api.ts` is `apiFetch`, not `apiRequest`. The `ApiError` class has `status` (number) and `message` (string inherited from Error) — no `code` property. The env var is `NEXT_PUBLIC_API_BASE`, not `NEXT_PUBLIC_API_BASE_URL`. The fetch mock also needed a `headers` object since `apiFetch` calls `res.headers.get("content-type")` to determine JSON vs text parsing.

Key changes:
- `import { apiRequest, ApiError }` → `import { apiFetch, ApiError }`
- `process.env.NEXT_PUBLIC_API_BASE_URL` → `process.env.NEXT_PUBLIC_API_BASE`
- Fetch mock: added `headers: { get: () => "application/json" }` and `json: async () => (...)` to trigger the JSON parse path
- Assertion: `{ status: 401, code: "UNAUTHORIZED" }` → `{ status: 401, message: "Nope" }`

---

## 6. __tests__/app_dashboard_page.test.jsx Changes

Replaced entirely. The original test tried to `require("../app/dashboard/DashboardClient")` which does not exist — the dashboard page is a server component at `app/dashboard/page.tsx` with no separately exported `DashboardClient`. Every run would have thrown `DashboardClient not found`.

The replacement tests `SiteNav`, a real, stable client component. Four tests covering the unauthenticated render state:
1. Brand link renders with correct accessible name
2. `<nav>` landmark with accessible name renders
3. Sign in + Get started links render when not authenticated
4. Logout button is absent when not authenticated

`lib/auth.getToken()` reads from `localStorage`, which is empty in jsdom by default, so the component naturally renders in the unauthenticated state without any explicit mocking of the auth module.

---

## 7. Build / Lint / Typecheck / Test Results

### Typecheck — `npm run typecheck` (tsc)

**Result: ✅ PASS — exit 0**

Ran successfully in the sandbox. TypeScript compilation found no errors across the entire codebase including the edited test files.

### Lint — `npm run lint` (next lint)

Cannot run `next lint` in this sandbox — `next lint` internally triggers the SWC compiler layer, and the `@next/swc-linux-x64-gnu` binary is network-allowlist-blocked (HTTP 403). The command times out.

Running ESLint directly (same config, same rules, without the compiler layer):

**Result: ✅ 0 errors, 5 warnings — exit 0**

Warnings (pre-existing, unchanged):
| File | Line | Rule |
|---|---|---|
| `app/professional/ceu/[courseId]/page.tsx` | 50 | `react-hooks/exhaustive-deps` — missing `loadProgress` |
| `app/professional/clients/[id]/boards/page.tsx` | 74 | `react-hooks/exhaustive-deps` — missing `loadAll` |
| `app/professional/clients/[id]/breaks/page.tsx` | 61 | `react-hooks/exhaustive-deps` — missing `loadAll` |
| `app/professional/clients/[id]/lessons/page.tsx` | 55 | `react-hooks/exhaustive-deps` — missing `loadAll` |
| `lib/api.ts` | 111 | `import/no-anonymous-default-export` |

No new errors or warnings were introduced by the test file changes.

### Build — `npm run build`

Cannot run in this sandbox. `@next/swc-linux-x64-gnu@14.1.0` is network-allowlist-blocked. This is a sandbox-only limitation — the build was confirmed passing on your Windows machine in the prior verification pass. No application code was changed in Phase 2.

**After running `npm install next@14.2.35` locally, run `npm run build` to confirm the upgrade doesn't regress anything.**

### Test — `npm test` (jest)

Cannot run. `jest` is not installed (npm install blocked). All packages must be installed locally first.

**After running the local installs, expected result:**
- `__tests__/api.test.ts` — 2 tests should pass (apiFetch error normalisation)
- `__tests__/app_dashboard_page.test.jsx` — 4 SiteNav tests should pass (jsdom renders the unauthenticated state, next/link and next/navigation are mocked in jest.setup.ts)

### Playwright — `npx playwright test --project=chromium`

Cannot run. `@playwright/test` is not installed.

---

## 8. npm audit Status After Next.js Upgrade

`npm audit` is network-blocked in this sandbox (POST to audit endpoint is allowlist-blocked). After running `npm install next@14.2.35` locally:

```bash
npm audit
npm audit --omit=dev --json
```

Expected outcome after the upgrade:
- **CVE-2025-29927** (Next.js middleware auth bypass, CVSS 9.1): **resolved** — patched at 14.2.25, and 14.2.35 ≥ 14.2.25
- **CVE-2025-55183 / CVE-2025-55184 / CVE-2025-67779** (React Server Components DoS, App Router): **resolved** — patched in later 14.2.x builds included in 14.2.35
- **jsPDF CVE-2025-68428**: **still reported** — requires 4.x major upgrade, deferred (see Section 9)

After the upgrade, `npm audit --omit=dev` should report only the jsPDF finding (or zero if the scanner agrees that client-side-only usage doesn't trigger the advisory). `npm audit` (including dev) should have no high/critical items beyond jsPDF.

---

## 9. jsPDF — Deferred Issue

`jspdf@2.5.2` has CVE-2025-68428 (critical, CVSS 9.2, path traversal). The fix requires a major version bump to 4.0.0.

**Deferred to a follow-up sprint.** Reasons:
- The only usage (`utils/QuizReportExporter.js`) runs entirely in the browser via `doc.save()` — the vulnerable server-side file-loading APIs (`addImage`/`html`/`addFont` with attacker-controlled paths) are not called
- `npm audit fix --force` would auto-upgrade 2.x → 4.x, which has a different filesystem-permission model and breaking API changes requiring deliberate testing
- The jsPDF 4.x migration should be its own reviewed change: upgrade the package, verify `QuizReportExporter.js` works correctly against the 4.x API, run the quiz PDF export manually, then ship

**Action:** Do not run `npm audit fix --force`. When ready to handle jsPDF, run:
```bash
npm install jspdf@^4.0.0 jspdf-autotable@^4.0.0
# Review and test utils/QuizReportExporter.js against the 4.x API
# Confirm quiz PDF export still works in the browser
```

---

## 10. Is the App Still Demo-Ready?

**Yes.** No application code (pages, components, routes, API calls, auth flow, UI) was changed in Phase 2. The only changes were:
- `package.json` scripts (added `test`/`e2e` — no effect on the running app)
- `jest.config.cjs` (Jest config only, not used by Next.js at all)
- `__tests__/` files (test-only, not included in the production build)

The live deployment on Vercel + Render is unaffected. All previously confirmed demo flows (register, login, courses, quiz submit/result, caregiver portal, professional portal, CEU) remain working.

---

## 11. Remaining Frontend Beta Blockers

| Blocker | Status | Action |
|---|---|---|
| next@14.1.0 has known CVEs (App Router DoS) | **Pending local install** | `npm install next@14.2.35 eslint-config-next@14.2.35` then verify build |
| No test packages installed | **Pending local install** | Full `npm install --save-dev jest@29 ...` command in Section 2 |
| npm test exits 1 (no jest binary) | **Pending local install** | Will resolve once jest is installed |
| jsPDF 2.5.2 CVE-2025-68428 | **Deferred** | Future sprint: test and ship jspdf@^4.0.0 |
| 5 pre-existing lint warnings | **Low priority** | Fix `react-hooks/exhaustive-deps` in professional portal pages before beta |
| No frontend automated test suite actually running yet | **Pending local install** | Once packages installed and bugs fixed, expected: 2 api tests + 4 SiteNav tests passing |
| Frontend npm audit not run (network blocked here) | **Pending local run** | Run `npm audit` locally after Next.js upgrade |

---

## 12. Exact Commands to Run Locally

Run these in order from the `microcourse-frontend` directory:

```bash
# 1. Upgrade Next.js (CVE fix, no major version bump)
npm install next@14.2.35 eslint-config-next@14.2.35

# 2. Install test infrastructure
npm install --save-dev jest@29 jest-environment-jsdom @testing-library/react@14 @testing-library/jest-dom@6 @testing-library/user-event@14 babel-jest identity-obj-proxy @playwright/test

# 3. Install Playwright browsers
npx playwright install chromium

# 4. Verify nothing broke
npm run build           # expect: pass
npm run lint            # expect: 0 errors, 5 warnings
npm run typecheck       # expect: exit 0 (already confirmed)

# 5. Run the new test suite
npm test                # expect: 6 tests passing (2 api + 4 SiteNav)

# 6. Run real npm audit
npm audit
npm audit --omit=dev --json

# 7. If Playwright is set up, run e2e against a local server
npm run dev &           # start dev server first
npm run e2e -- --project=chromium
```

---

**Nothing has been committed.** All file changes are saved to your folder and ready for review.
