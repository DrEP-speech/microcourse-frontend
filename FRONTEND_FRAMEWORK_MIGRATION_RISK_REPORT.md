# Frontend Framework Migration Risk Report

**Date:** 2026-06-30
**Scope:** `microcourse-frontend` only. Report only — no files modified.
**Trigger:** `npm audit --omit=dev` reports 5 production vulnerabilities; `npm audit fix --force` would install next@16.2.9 and jspdf@4.2.1 (both breaking major upgrades). This report assesses risk before any action is taken.

---

## 1. Current Installed Versions

All versions confirmed from `package-lock.json` (lockfileVersion 3):

| Package | Installed version | Source |
|---|---|---|
| `next` | 14.2.35 | production dep |
| `eslint-config-next` | 14.2.35 | dev dep |
| `react` | 18.2.0 | production dep |
| `react-dom` | 18.2.0 | production dep |
| `@types/react` | 18.3.31 | dev dep |
| `@types/react-dom` | 18.3.7 | dev dep |
| `jspdf` | 2.5.2 | production dep |
| `jspdf-autotable` | 3.8.4 | production dep |
| `dompurify` | 2.5.9 | optional (transitive via jspdf) |
| `postcss` | 8.4.31 | transitive (via next) |

**No `dompurify` direct dependency.** It is installed as an optional transitive dependency pulled in by `jspdf`. It is not imported anywhere in app source code.

---

## 2. Known Vulnerabilities in Current Versions

| CVE | Package | CVSS | Description | Status at 14.2.35 |
|---|---|---|---|---|
| CVE-2025-29927 | next@14.1.x | 9.1 Critical | Middleware auth bypass | **Resolved** — patched at 14.2.25; 14.2.35 is safe |
| CVE-2025-55183 | next@14.1.x | App Router DoS via RSC | **Resolved** — patched in 14.2.x |
| CVE-2025-55184 | next@14.1.x | App Router DoS via RSC | **Resolved** — patched in 14.2.x |
| CVE-2025-67779 | next@14.1.x | App Router DoS via RSC | **Resolved** — patched in 14.2.x |
| CVE-2025-68428 | jspdf@2.5.2 | 9.2 Critical | Path traversal in Node.js file loading | Unresolved — fixed only in jspdf@4.x |

**Practical note on CVE-2025-68428:** The vulnerable code paths are Node.js server-side file operations (`addImage`, `html()`, `addFont` with file path arguments). The only usage in this codebase is `utils/QuizReportExporter.js`, which runs entirely in the browser and only calls `new jsPDF()`, `autoTable(doc, {...})`, `doc.text()`, and `doc.save()`. None of the vulnerable APIs are called. Exploitability in this deployment context is effectively zero, but `npm audit` will continue to flag it.

---

## 3. Option Comparison — Risk Table

### Option A — Stay on Next.js 14.2.35 (current)

| Factor | Assessment |
|---|---|
| **What changes** | Nothing |
| **React version** | 18.2.0 (unchanged) |
| **Security risk** | next CVEs already resolved at 14.2.35. jspdf CVE unresolved but low practical exploitability (client-side only usage). No new CVEs introduced. |
| **Beta readiness** | ✅ App is demo-ready today. Build passing. Lint clean. |
| **Pros** | Zero migration risk. Zero breakage. Deploy confidence is high. |
| **Cons** | jspdf CVE will continue to appear in `npm audit`. `npm audit --omit=dev` will remain non-zero. No forward investment in security posture. |
| **Recommendation** | Acceptable short-term holding position only. Not a long-term answer. |

---

### Option B — Upgrade to Next.js 15.5.18

| Factor | Assessment |
|---|---|
| **What changes** | next@15, react@19, react-dom@19, eslint-config-next@15, @types/react@^19, @types/react-dom@^19 |
| **React version required** | React 19.x (minimum) — upgrade from 18.2.0 |
| **Security improvements** | Resolves any remaining Next 14.x advisories not yet in 14.2.35. jspdf CVE still present unless also upgraded. |
| **Beta readiness** | Requires code fixes and validation before deployment. Not instant. |

**Breaking changes that affect this codebase:**

Next.js 15 makes `params` (in page/layout server components), `cookies()`, `headers()`, and `draftMode()` asynchronous. Synchronous access shows a deprecation warning in v15 and is fully removed in v16.

One file in this codebase uses the old sync pattern:

```
app/courses/[courseId]/page.tsx (line 5):
  export default function CourseDetailsPage({ params }: { params: { courseId: string } })
  → accesses params.courseId synchronously
```

All other dynamic route pages (`[id]`, `[quizId]`, `[courseId]` under professional) use `useParams()` from `next/navigation` in `"use client"` components — those are **not affected**.

Additional breaking changes in Next.js 15:
- `fetch()` no longer cached by default (all 3 Route Handlers already use `dynamic = "force-dynamic"`, so no regression)
- `GET` route handlers no longer cached by default (already `force-dynamic`, no regression)
- React 19: `useFormState` → `useActionState` (this app does not use either)
- React 19: `@types/react` and `@types/react-dom` must be upgraded to v19 types
- `next lint` command still works in v15 (removed only in v16)
- Node.js 18+ still supported in v15 (requirement unchanged from v14)

| Risk axis | Assessment |
|---|---|
| **App source changes needed** | 1 file: `app/courses/[courseId]/page.tsx` — convert to async server component + await params |
| **Build risk** | Low-Medium — one sync-params fix; React 19 peer dep upgrade |
| **Lint risk** | Low — `next lint` still works; `eslint-config-next@15` compatible with ESLint v8 |
| **Typecheck risk** | Medium — @types/react v19 has minor type signature changes |
| **Test risk** | Medium — @testing-library/react@14 supports React 19; jest config unchanged |
| **Deployment risk** | Low — Vercel supports Next.js 15 fully; Node.js version unchanged |
| **Reversibility** | High — branch-based; main stays at 14.2.35 until validated |

**Verdict: Next.js 15.x is the recommended migration target** (see Section 6).

---

### Option C — Upgrade to Next.js 16.2.9

| Factor | Assessment |
|---|---|
| **What changes** | next@16, react@19.2 (Canary), react-dom@19.2, eslint-config-next@16, @types/react@^19, @types/react-dom@^19, ESLint flat config migration |
| **React version required** | React 19.2 (Canary release) |
| **Node.js required** | **Node.js 20.9+ minimum. Node.js 18 no longer supported.** Must verify Render.com deployment Node.js version before proceeding. |
| **Security improvements** | Highest — latest release. jspdf CVE still present unless also upgraded. |
| **Beta readiness** | High effort. Multiple breaking changes. Not recommended until v15.x validated first. |

**Breaking changes that affect this codebase:**

In addition to everything in Next.js 15:

1. **Sync `params` fully removed (hard break).** `app/courses/[courseId]/page.tsx` sync params access will throw at runtime — not just warn. Must be fixed before the build will work correctly.

2. **`next lint` command removed.** The current `"lint": "next lint"` script in `package.json` will fail with "command not found". Must be replaced with direct ESLint invocation:
   ```json
   "lint": "eslint . --ext .js,.jsx,.ts,.tsx"
   ```
   Additionally, `@next/eslint-plugin-next` v16 defaults to **ESLint Flat Config** format. The existing `.eslintrc.json` or `.eslintrc.js` must be migrated to `eslint.config.js`. This is a non-trivial change.

3. **Turbopack by default.** `next build` now uses Turbopack instead of Webpack. `next.config.mjs` has no custom webpack config so there should be no breakage, but this is a new compiler and must be validated.

4. **`next dev` writes to `.next/dev`** instead of `.next` — any CI/deploy scripts referencing `.next` directly should be checked.

5. **`middleware` renamed to `proxy`.** No active `middleware.ts` in this app — not applicable.

6. **`revalidateTag` requires 2 args.** Not used in this app — not applicable.

7. **AMP support removed.** Not used — not applicable.

8. **React 19.2 Canary.** Using a Canary React in production carries additional risk. `@testing-library/react@14` may not have full compatibility with React 19.2 Canary builds.

| Risk axis | Assessment |
|---|---|
| **App source changes needed** | 1 file (sync params), package.json lint script, ESLint config migration |
| **Build risk** | High — Turbopack by default, new compiler, ESLint flat config required |
| **Lint risk** | High — `next lint` removed, ESLint flat config migration required |
| **Typecheck risk** | Medium — React 19.2 types are Canary, may have instability |
| **Test risk** | High — React 19.2 Canary + @testing-library compatibility unverified |
| **Deployment risk** | High — Node.js 20.9+ required; must check Render.com Node version |
| **Reversibility** | High (branch-based) but recovery from a bad Turbopack + React Canary combination is complex |

**Verdict: Option C should not be the first migration step.** The correct path is 14.2.35 → 15.x → 16.x in two separate branches, validated sequentially.

---

## 4. Codebase Migration Risk Inventory

### next.config.mjs — Risk: Minimal

```js
const nextConfig = {
  output: "standalone",
  reactStrictMode: true
};
```

No experimental flags, no custom webpack, no image domains, no turbopack config, no AMP. This config is compatible with Next.js 14, 15, and 16 without modification (except that `output: "standalone"` is fully supported in all three).

### Active middleware — Risk: None

`middleware.ts` exists only in `_ARCHIVED_20260624/_deprecated/middleware.ts` — it is dead/archived code, not loaded by Next.js. The active app has no middleware. There is no middleware rename impact for Option C.

### App Router API Routes — Risk: Low

Three route handlers:
- `app/api/health/route.ts` — returns static JSON. `dynamic = "force-dynamic"`, `runtime = "nodejs"`. Safe in 15 and 16.
- `app/api/courses/route.ts` — `dynamic = "force-dynamic"`, fetches from backend with `cache: "no-store"`. Safe in 15 and 16.
- `app/api/[...path]/route.ts` — catch-all backend proxy. `dynamic = "force-dynamic"`. Reads `req.url` and `req.method`, not segment `params`. Safe in 15. In 16, the `params` from the catch-all segment would need to be awaited if accessed — but this handler does not destructure segment params at all; it reads `req.url` directly. **Safe in 16 as written.**

### Dynamic route pages — Risk: One file

| File | params access | Client/Server | Risk |
|---|---|---|---|
| `app/courses/[courseId]/page.tsx` | Sync props destructure: `{ params }` → `params.courseId` | **Server component** (no `"use client"`) | ⚠️ **BREAKING in Next.js 16, warning in 15** |
| `app/professional/ceu/[courseId]/page.tsx` | `useParams()` hook | Client (`"use client"`) | ✅ Safe |
| `app/professional/clients/[id]/page.tsx` | `useParams()` hook | Client | ✅ Safe |
| `app/professional/clients/[id]/boards/page.tsx` | `useParams()` hook | Client | ✅ Safe |
| `app/professional/clients/[id]/breaks/page.tsx` | `useParams()` hook | Client | ✅ Safe |
| `app/professional/clients/[id]/lessons/page.tsx` | `useParams()` hook | Client | ✅ Safe |
| `app/quiz/[quizId]/page.jsx` | `useParams()` hook | Client | ✅ Safe |

**Fix required for `app/courses/[courseId]/page.tsx`** (Next.js 15 → 16 path):

```tsx
// Before (current — sync params, works in Next 14, warning in 15, hard break in 16)
export default function CourseDetailsPage({ params }: { params: { courseId: string } }) {
  return <main><CourseDetailsClient courseId={params.courseId} /></main>;
}

// After (async params — required for Next 15/16)
export default async function CourseDetailsPage(props: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await props.params;
  return <main><CourseDetailsClient courseId={courseId} /></main>;
}
```

### cookies(), headers(), server actions, useFormState — Risk: None

Confirmed not present anywhere in the active application source. All pages are `"use client"` components communicating with the backend via `apiFetch`. No server actions, no `cookies()`, no `headers()`.

### next/image — Risk: None

`next/image` is not imported anywhere in the active application source. No image optimization changes in Next.js 15 or 16 affect this codebase.

### next/link — Risk: None

Standard usage: `import Link from "next/link"` with `href` and text children. No `<a>` child pattern (already removed in Next.js 13). Compatible with 14, 15, and 16.

### next/navigation — Risk: None

`useRouter`, `useParams`, `usePathname`, `redirect` — all standard stable APIs unchanged across 14, 15, and 16.

### next/dynamic — Risk: None

Used in `app/page.tsx` and `app/login/page.tsx` for SSR-safe component loading. Stable API, unchanged across versions.

### Experimental flags — Risk: None

None present in `next.config.mjs`.

### Custom webpack — Risk: None

None present. Turbopack-by-default (Next.js 16) will not break this app.

### "use client" coverage

Virtually every page component carries `"use client"`. The app is functionally a client-rendered SPA under the App Router shell. This is an advantage for migration: most breaking changes in Next.js 15/16 affect server components and async APIs, which this app barely uses.

---

## 5. jsPDF Usage Audit

### Import and usage — confirmed

**File:** `utils/QuizReportExporter.js` (only occurrence in the entire codebase)

```js
import jsPDF from 'jspdf';           // default import
import autoTable from 'jspdf-autotable';

export function exportQuizReviewToPDF(quizId, data) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`Quiz Review Summary: ${quizId}`, 14, 20);
  doc.setFontSize(12);
  autoTable(doc, {
    startY: 30,
    head: [['Question', 'Your Answer', 'Correct Answer', 'Result']],
    body: data?.questions?.map(q => [...]) || []
  });
  doc.text(`Score: ${data?.score || '--'}%`, 14, doc.lastAutoTable.finalY + 10);
  doc.save(`quiz_review_${quizId}.pdf`);
}
```

**The function is defined but not imported anywhere in the active app.** Searching all `.ts`, `.tsx`, `.js`, `.jsx` files confirms `exportQuizReviewToPDF` and `QuizReportExporter` are referenced only in the utils file itself — not called from any page, component, or other utility. The PDF export may be dead code or linked from a page not yet scanned (e.g. a quiz results page), but no active import was found.

### CVE-2025-68428 exposure — None

APIs confirmed NOT used: `addImage`, `html()`, `addFont`, `createObjectURL`, `readAsDataURL`, no file paths, no attacker-controlled input paths. The only outputs are `doc.text()` (literal strings), `autoTable(doc, {...})` (structured data), and `doc.save()` (browser download). This is browser-only execution.

### Migration risk from jspdf 2.5.2 → 4.x

| Change | Impact on `QuizReportExporter.js` |
|---|---|
| Default import changed | `import jsPDF from 'jspdf'` → `import { jsPDF } from 'jspdf'` (named export) — **1-line fix** |
| `autoTable(doc, {...})` call pattern | Already the new recommended pattern — **no change needed** |
| `doc.lastAutoTable.finalY` | Property still present in autotable 4.x — no change needed |
| `doc.text()`, `doc.setFontSize()` | Core stable API — unchanged |
| `doc.save()` | Core stable API — unchanged |
| `jspdf-autotable` peer dep | Must upgrade to `jspdf-autotable@^4.0.0` alongside `jspdf@^4.0.0` |

**jsPDF 4.x migration difficulty for this app: Low (1 import line change + peer dep upgrade).**

However: since the function may be dead code or not yet wired to a UI button, confirm it's actually used in the deployed app before investing time in the jsPDF upgrade. If it's live, test the PDF export manually after upgrade (open quiz results, click export, verify the downloaded PDF is correct).

---

## 6. Recommended Migration Path

**Recommended:** Option B — Next.js 15.x — executed on a dedicated branch.

**Do not run `npm audit fix --force`.** This will blindly install next@16.2.9 on `main`, breaking the build and requiring an immediate rollback.

**Do not upgrade Next.js to 16.x as the first step.** The correct sequence is 14.2.35 → 15.x, validated, then 15.x → 16.x as a separate future sprint.

### Why Option B over Option C

Next.js 15 has one code fix needed (1 file, sync params). Next.js 16 has three additional breaking changes for this app (sync params hard removal, `next lint` removed, ESLint flat config migration) plus a Node.js version requirement check. Option B captures the same security improvements with 80% less blast radius.

### Why Option B over Option A

Staying on 14.2.35 indefinitely means `npm audit --omit=dev` never goes clean (jsPDF), and creates growing divergence from the upstream Next.js release line. Option B is the responsible forward path for a beta-bound product.

---

## 7. Migration Branch Strategy

### Branch name

```
chore/frontend-security-migration
```

### Create the branch

```bash
cd microcourse-frontend
git checkout main
git pull
git checkout -b chore/frontend-security-migration
```

### Step 1 — Upgrade Next.js to 15.x and React to 19

```bash
npm install next@15 react@19 react-dom@19
npm install --save-dev eslint-config-next@15 @types/react@^19 @types/react-dom@^19
```

### Step 2 — Fix the one breaking code change

Edit `app/courses/[courseId]/page.tsx`:

```tsx
// Before
export default function CourseDetailsPage({ params }: { params: { courseId: string } }) {
  return (
    <main>
      <CourseDetailsClient courseId={params.courseId} />
    </main>
  );
}

// After
export default async function CourseDetailsPage(props: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await props.params;
  return (
    <main>
      <CourseDetailsClient courseId={courseId} />
    </main>
  );
}
```

(The `export const dynamic = "force-dynamic"` line stays unchanged.)

### Step 3 — Upgrade jsPDF (do alongside Next.js upgrade)

```bash
npm install jspdf@^4.0.0 jspdf-autotable@^4.0.0
```

Edit `utils/QuizReportExporter.js`:

```js
// Before
import jsPDF from 'jspdf';

// After
import { jsPDF } from 'jspdf';
```

Everything else in `QuizReportExporter.js` remains unchanged.

### Step 4 — Run the full validation suite

```bash
# TypeScript
npm run typecheck        # expect: exit 0

# Lint
npm run lint             # expect: 0 errors (may see new warnings from next 15 rules)

# Unit tests
npm test                 # expect: 6 tests passing

# Build
npm run build            # expect: successful Next.js 15 build

# Audit
npm audit --omit=dev     # expect: 0 vulnerabilities (jsPDF resolved, Next resolved)
npm audit                # expect: 0 high/critical

# E2E (optional, if Playwright installed)
npm run dev &
npm run e2e -- --project=chromium
```

### Step 5 — Manual checks that cannot be automated

| Check | What to look for |
|---|---|
| Full login flow | Register → login → dashboard loads |
| Course catalog | `/courses` loads, course cards render |
| Course detail | `/courses/[courseId]` loads via the fixed async params page |
| Quiz flow | Quiz loads, answers selectable, submit works |
| Quiz PDF export | If wired to UI: click export button, verify PDF downloads and renders correctly |
| Professional portal | Portal loads, client list visible |
| CEU flow | CEU catalog and course player load |
| Caregiver portal | Mood/regulation flows work |
| No console errors | Open DevTools, walk all pages, look for unhandled promise rejections |

### Step 6 — Only then merge

```bash
git add -A
git commit -m "chore: upgrade Next.js 14.2.35→15.x, React 18→19, jsPDF 2.5.2→4.x

- next@15, react@19, react-dom@19, eslint-config-next@15
- jspdf@4.x, jspdf-autotable@4.x
- Fix app/courses/[courseId]/page.tsx: async params (Next 15 requirement)
- Fix utils/QuizReportExporter.js: named jsPDF import (jspdf 4.x requirement)
- npm audit --omit=dev: 0 vulnerabilities after upgrade
- All tests passing, build passing, lint clean"

git checkout main
git merge chore/frontend-security-migration
```

---

## 8. What NOT to Touch

| Thing | Reason |
|---|---|
| `npm audit fix --force` on main | Will blindly install next@16.2.9, breaking the build |
| Next.js 16.x as first step | Too many simultaneous breaking changes |
| Backend (`microcourse-backend-final-clean`) | Out of scope for this migration |
| `package.json` `"lint": "next lint"` script | Still valid in Next.js 15; only needs changing for 16.x |
| `.eslintrc` or ESLint config format | ESLint flat config is required only in Next.js 16; skip for 15.x migration |
| `middleware.ts` in `_ARCHIVED_20260624` | Dead/archived; ignore |
| `"use client"` directives on pages | These already protect most pages from the async params breaking change |
| `app/api/[...path]/route.ts` | The catch-all proxy does not destructure segment params; no change needed |

---

## 9. Future Sprint: Next.js 16.x

After Next.js 15.x is validated on main, a follow-up sprint for 16.x would require:

1. Verify Node.js version on Render.com is 20.9+ (upgrade if not)
2. `npm install next@16 react@latest react-dom@latest`
3. Migrate `"lint": "next lint"` → `"lint": "eslint ."` + install `@eslint/eslintrc` if needed
4. Migrate ESLint config from `.eslintrc` format to flat `eslint.config.js`
5. Verify Turbopack build works (should be automatic with no custom webpack)
6. Re-run full validation suite

---

## 10. Summary

| | Option A (stay 14.2.35) | Option B (→ Next 15.x) ✅ | Option C (→ Next 16.x) |
|---|---|---|---|
| Security posture | Vulnerable (jsPDF) | Clean | Clean |
| Code changes | 0 | 2 files | 4+ changes |
| React upgrade | None | 18 → 19 | 18 → 19.2 Canary |
| Node.js upgrade | None | None | 20.9+ required |
| Build risk | None | Low | High |
| Demo readiness | ✅ Now | ✅ After validation | ⚠️ After significant work |
| Recommended | Hold only | **Yes — first step** | Future sprint only |

**Recommended path:** Create branch `chore/frontend-security-migration`, run the exact commands in Section 7, validate all checks in Step 4 and Step 5, then merge to main.

---

*Sources: [Next.js 15 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-15) · [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16) · [jsPDF-AutoTable releases](https://github.com/simonbengtsson/jsPDF-AutoTable/releases)*
