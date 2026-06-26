import fs from "fs";
import path from "path";
import { chromium } from "@playwright/test";

const backendDir  = process.env.MC_BACKEND_DIR || process.cwd();
const seedPath    = process.env.MC_SEED_PATH || path.join(backendDir, "seed-artifacts.json");
const frontendUrl = process.env.MC_FRONTEND_URL || "http://localhost:3000";

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
const token = seed?.student?.token;
if (!token) throw new Error("seed.student.token missing");

const apiBase = (seed?.base || "http://localhost:4000/api").replace(/\/+$/, "");
console.log("[INFO] Using student token from seed-artifacts.json");
console.log("[INFO] API Base:", apiBase);
console.log("[INFO] Frontend:", frontendUrl);

async function getBackendFirstTitle() {
  const res = await fetch(`${apiBase}/courses`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Backend courses failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  const list = Array.isArray(data) ? data : (data?.courses || data?.data || []);
  const first = list?.[0];
  const title = first?.title || first?.name || first?.slug;
  if (!title) throw new Error("Could not derive a title from backend response");
  return title;
}

const expectedTitle = await getBackendFirstTitle();
console.log("[INFO] Expecting title:", expectedTitle);

const browser = await chromium.launch();
const context = await browser.newContext();

// ✅ Robust cookie setting: use domain + path (middleware reads cookies, not localStorage)
const u = new URL(frontendUrl);
await context.addCookies([{
  name: "mc_token",
  value: token,
  domain: u.hostname,   // e.g. "localhost"
  path: "/"
}]);

const page = await context.newPage();

// Still set localStorage too (client-side fetches often use it)
await page.addInitScript((tkn) => {
  localStorage.setItem("token", tkn);
  localStorage.setItem("authToken", tkn);
  localStorage.setItem("accessToken", tkn);
  localStorage.setItem("auth", JSON.stringify({ token: tkn }));
}, token);

await page.goto(`${frontendUrl}/courses`, { waitUntil: "networkidle" });

const bodyText = await page.locator("body").innerText();

// If still gated, you’ll usually see login page text/buttons
if (/login|sign in|sign-in|signin/i.test(bodyText) && !bodyText.includes(expectedTitle)) {
  console.error("[FAIL] Frontend appears gated by login (cookie/localStorage token not recognized).");
  console.error("[DEBUG] Page text (first 700 chars):");
  console.error(bodyText.slice(0, 700));
  process.exit(1);
}

if (/placeholder view backed by demo data/i.test(bodyText)) {
  throw new Error("Frontend is still showing placeholder demo data. /courses not wired to backend.");
}

const found = await page.locator(`text=${expectedTitle}`).first().count();
if (!found) {
  console.error("[FAIL] Rendered /courses did not contain expected title:", expectedTitle);
  console.error("[DEBUG] Page text (first 700 chars):");
  console.error(bodyText.slice(0, 700));
  process.exit(1);
}

console.log("[PASS] E2E OK: /courses rendered backend course title.");
await browser.close();
process.exit(0);
