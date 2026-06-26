import { test, expect } from "@playwright/test";

const UI_BASE = process.env.E2E_BASE_URL || "http://localhost:3000";
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

const seededEmail = process.env.SEED_STUDENT_EMAIL || "student@example.com";
const seededPassword = process.env.SEED_STUDENT_PASSWORD || "Password123!";

test("E2E: token -> courses -> course -> quiz -> submit -> results render", async ({ page, request }) => {
  // 1) Backend login
  const res = await request.post(`${API_BASE}/api/auth/login`, {
    data: { email: seededEmail, password: seededPassword },
  });
  expect(res.ok(), "Backend login should succeed for seeded student").toBeTruthy();
  const json: any = await res.json();
  const token = json.token;
  expect(token, "Backend should return token").toBeTruthy();

  // 2) Set token into localStorage before app loads
  await page.addInitScript(([t]) => {
    window.localStorage.setItem("mc_token", t as string);
  }, [token]);

  // 3) Go to courses (handle redirect)
  await page.goto(`${UI_BASE}/courses`, { waitUntil: "domcontentloaded" });

  // 4) Find first course link/card across common UIs
  const courseLink = page.locator(
    'a[href^="/courses/"], a[href^="/dashboard/courses/"], [data-testid="course-link"], [data-testid="course-card"] a'
  ).first();

  await expect(courseLink, "Course link/card should be visible").toBeVisible({ timeout: 20000 });
  await courseLink.click();

  // 5) Find first quiz link (supports /quiz/<id> or /quizzes/<id>)
  const quizLink = page.locator('a[href^="/quiz/"], a[href^="/quizzes/"], [data-testid="quiz-link"]').first();
  await expect(quizLink, "Quiz link should be visible").toBeVisible({ timeout: 20000 });
  await quizLink.click();

  // 6) Answer something (generic: click first radio/option button if present)
  const option = page.locator('input[type="radio"], button[data-testid^="option-"], button:has-text("A"), button:has-text("B")').first();
  if (await option.count()) {
    await option.click();
  }

  // 7) Submit
  const submitBtn = page.locator('button:has-text("Submit"), [data-testid="submit-quiz"]').first();
  await expect(submitBtn, "Submit button should be visible").toBeVisible({ timeout: 20000 });
  await submitBtn.click();

  // 8) Results render
  const results = page.locator('[data-testid="quiz-results"], text=/Score|Results|Correct/i').first();
  await expect(results, "Results should render").toBeVisible({ timeout: 20000 });
});