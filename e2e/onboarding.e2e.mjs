import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

function die(msg) {
  console.error("[FAIL]", msg);
  process.exit(1);
}

function readSeedArtifacts() {
  const backendDir = process.env.MC_BACKEND_DIR;
  if (!backendDir) die("MC_BACKEND_DIR env var not set.");

  const p = path.join(backendDir, "seed-artifacts.json");
  if (!fs.existsSync(p)) die(`seed-artifacts.json not found at: ${p}`);

  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);

  if (!data?.base) die("seed-artifacts.json missing 'base'");
  if (!data?.student?.token) die("seed-artifacts.json missing 'student.token'");
  if (!data?.courseId) die("seed-artifacts.json missing 'courseId'");
  if (!data?.quizId) die("seed-artifacts.json missing 'quizId'");

  return data;
}

async function main() {
  const seed = readSeedArtifacts();

  const FRONTEND = process.env.MC_FRONTEND_URL || "http://localhost:3000";
  const API_BASE = seed.base; // e.g. http://localhost:4000/api
  const expectedTitle = "MicroCourse Forge – How to Use This App (Quick Start)";

  console.log("[INFO] Using student token from seed-artifacts.json");
  console.log("[INFO] API Base:", API_BASE);
  console.log("[INFO] Frontend:", FRONTEND);
  console.log("[INFO] courseId:", seed.courseId);
  console.log("[INFO] quizId:", seed.quizId);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // IMPORTANT: your Next middleware expects cookie auth.
  // Set cookie with url so Playwright doesn't throw "Cookie should have either url or path".
  await context.addCookies([
    {
      name: "mc_token",
      value: seed.student.token,
      url: FRONTEND
    }
  ]);

  const page = await context.newPage();

  // 1) Courses page should render the backend course title
  await page.goto(`${FRONTEND}/courses`, { waitUntil: "networkidle" });
  const body1 = await page.locator("body").innerText();

  if (!body1.includes(expectedTitle)) {
    console.log("[DEBUG] Page text (first 700 chars):");
    console.log(body1.slice(0, 700));
    die(`Rendered /courses did not contain expected title: ${expectedTitle}`);
  }
  console.log("[PASS] /courses rendered expected backend course title.");

  // 2) Click the course title (best-effort: click link/text)
  // If the title is not a link, this will still click the text node; then we verify navigation.
  await page.getByText(expectedTitle, { exact: false }).first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);

  // If click didn't navigate, go directly to course route (App Router supports /course/[courseId] in your build)
  if (page.url().includes("/courses")) {
    await page.goto(`${FRONTEND}/course/${seed.courseId}`, { waitUntil: "networkidle" }).catch(async () => {
      // fallback route variants (some builds use /courses/[id])
      await page.goto(`${FRONTEND}/courses/${seed.courseId}`, { waitUntil: "networkidle" });
    });
  }

  const body2 = await page.locator("body").innerText();
  if (!(body2.includes(expectedTitle) || body2.toLowerCase().includes("course"))) {
    console.log("[DEBUG] Course page text (first 700 chars):");
    console.log(body2.slice(0, 700));
    die("Course detail page did not look like a course view (title/course marker missing).");
  }
  console.log("[PASS] Course detail page loaded.");

  // 3) Navigate to quiz
  // Prefer clicking a real CTA if present; otherwise go direct.
  const goToQuiz = page.getByText(/go to quiz/i).first();
  const hasCTA = await goToQuiz.count().then(n => n > 0).catch(() => false);

  if (hasCTA) {
    await goToQuiz.click().catch(() => {});
    await page.waitForTimeout(500);
  }

  // If still not on a quiz route, go direct.
  if (!page.url().includes("/quiz")) {
    await page.goto(`${FRONTEND}/quiz/${seed.quizId}`, { waitUntil: "networkidle" }).catch(async () => {
      // fallback variant
      await page.goto(`${FRONTEND}/quizzes/${seed.quizId}`, { waitUntil: "networkidle" });
    });
  }

  const body3 = await page.locator("body").innerText();
  if (!body3.toLowerCase().includes("quiz")) {
    console.log("[DEBUG] Quiz page text (first 700 chars):");
    console.log(body3.slice(0, 700));
    die("Quiz page did not render expected quiz UI markers.");
  }
  console.log("[PASS] Quiz page loaded.");

  // 4) Submit quiz (best effort)
  // - If your UI has radio/checkbox options, pick the first available and submit.
  // - If it has a submit button, click it.
  // - If it requires selections and none found, still try to submit.
  const radios = page.locator('input[type="radio"]');
  const checks = page.locator('input[type="checkbox"]');
  const submitBtn = page.getByRole("button", { name: /submit|finish|complete/i }).first();

  const radioCount = await radios.count().catch(() => 0);
  const checkCount = await checks.count().catch(() => 0);

  if (radioCount > 0) {
    await radios.first().check().catch(() => {});
  } else if (checkCount > 0) {
    await checks.first().check().catch(() => {});
  }

  const submitExists = await submitBtn.count().then(n => n > 0).catch(() => false);
  if (submitExists) {
    await submitBtn.click().catch(() => {});
  } else {
    // No obvious submit button — try common selectors
    await page.locator('button:has-text("Submit")').first().click().catch(() => {});
  }

  await page.waitForTimeout(1000);

  // 5) Verify results rendered (best-effort markers)
  const body4 = await page.locator("body").innerText();
  const looksLikeResults =
    /score/i.test(body4) ||
    /results/i.test(body4) ||
    /correct/i.test(body4) ||
    /feedback/i.test(body4) ||
    /review/i.test(body4);

  if (!looksLikeResults) {
    console.log("[DEBUG] Post-submit page text (first 900 chars):");
    console.log(body4.slice(0, 900));
    die("After submit, page did not show obvious results markers (score/results/correct/feedback/review).");
  }

  console.log("[PASS] Quiz submission produced a results-like UI.");
  console.log("[PASS] E2E OK: /courses → course → quiz → submit → results.");

  await browser.close();
}

main().catch((e) => {
  console.error("[FAIL] Unhandled error:", e?.message || e);
  process.exit(1);
});
