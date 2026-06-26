import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

function getEnv(name, fallback = "") {
  return process.env[name] || fallback;
}

function loadSeedToken(mcBackendDir) {
  const p = path.join(mcBackendDir, "seed-artifacts.json");
  const raw = fs.readFileSync(p, "utf-8");
  const json = JSON.parse(raw);
  const token =
    json?.student?.token ||
    json?.tokens?.student ||
    json?.studentToken ||
    null;
  if (!token) throw new Error("Could not find student token in seed-artifacts.json");
  return token;
}

async function main() {
  const MC_BACKEND_DIR = getEnv("MC_BACKEND_DIR");
  const FRONTEND = getEnv("MC_FRONTEND_URL", "http://localhost:3000");
  const API_BASE = getEnv("MC_API_BASE", "http://localhost:4000/api");

  if (!MC_BACKEND_DIR) throw new Error("MC_BACKEND_DIR env var is required (path to backend folder).");

  const token = loadSeedToken(MC_BACKEND_DIR);

  console.log("[INFO] API Base:", API_BASE);
  console.log("[INFO] Frontend:", FRONTEND);

  const browser = await chromium.launch();
  const ctx = await browser.newContext();

  // Put token where your UI reads it (you now support token/authToken/accessToken)
  const page = await ctx.newPage();
  await page.goto(FRONTEND, { waitUntil: "domcontentloaded" });
  await page.evaluate((t) => {
    localStorage.setItem("token", t);
    localStorage.setItem("authToken", t);
    localStorage.setItem("accessToken", t);
  }, token);

  // 1) Courses page should render real data
  await page.goto(`${FRONTEND}/courses`, { waitUntil: "networkidle" });
  const coursesText = await page.textContent("body");
  if (!coursesText || !coursesText.includes("Courses")) {
    throw new Error("[FAIL] /courses did not render expected content.");
  }

  // 2) Click first "Open course →"
  const openLink = page.locator('a:has-text("Open course")').first();
  const openCount = await openLink.count();
  if (openCount === 0) {
    throw new Error("[FAIL] No course links found on /courses. Ensure courses render and include IDs.");
  }
  await openLink.click();
  await page.waitForLoadState("networkidle");

  // 3) On course page, click first "Start quiz →"
  const startQuiz = page.locator('a:has-text("Start quiz")').first();
  const quizCount = await startQuiz.count();
  if (quizCount === 0) {
    const body = await page.textContent("body");
    console.log("[DEBUG] Course page body (first 600):\n", (body || "").slice(0, 600));
    throw new Error("[FAIL] No quizzes found on course page. Ensure backend returns quizzes for that course.");
  }
  await startQuiz.click();
  await page.waitForLoadState("networkidle");

  // 4) Answer the first question by selecting first radio option (best-effort)
  const firstRadio = page.locator('input[type="radio"]').first();
  const radioCount = await firstRadio.count();
  if (radioCount === 0) {
    const body = await page.textContent("body");
    console.log("[DEBUG] Quiz page body (first 600):\n", (body || "").slice(0, 600));
    throw new Error("[FAIL] No radio options found. Quiz questions/options may not be in expected shape.");
  }
  await firstRadio.check();

  // 5) Submit
  const submitBtn = page.locator('button:has-text("Submit")').first();
  await submitBtn.click();

  // 6) Expect Result block to appear
  await page.waitForTimeout(500);
  const resultBlock = page.locator('text=Result').first();
  const resultCount = await resultBlock.count();
  if (resultCount === 0) {
    const body = await page.textContent("body");
    console.log("[DEBUG] After submit body (first 800):\n", (body || "").slice(0, 800));
    throw new Error("[FAIL] Result did not render after submit. Check submit endpoint + payload mapping.");
  }

  console.log("[PASS] E2E OK: /courses → course → quiz → submit → result rendered.");
  await browser.close();
}

main().catch((e) => {
  console.error(String(e?.stack || e));
  process.exit(1);
});
