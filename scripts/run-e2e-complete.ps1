param(
  [switch]$Headed,
  [string]$Project = "chromium"
)

$ErrorActionPreference = "Stop"

# Optional: set these if you want to avoid API login inside the test
# $env:SEED_STUDENT_TOKEN = "paste_token_here"
# Or:
# $env:SEED_STUDENT_EMAIL = "student@example.com"
# $env:SEED_STUDENT_PASSWORD = "Password123!"

$env:PLAYWRIGHT_BASE_URL = $env:PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"
$env:API_BASE_URL = $env:API_BASE_URL ?? "http://localhost:4000"

if ($Headed) {
  npx playwright test tests/e2e/e2e-student-complete-path.spec.ts --project=$Project --headed
} else {
  npx playwright test tests/e2e/e2e-student-complete-path.spec.ts --project=$Project
}