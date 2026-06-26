param(
  [switch]$Headed,
  [string]$Project = "chromium"
)

$ErrorActionPreference = "Stop"

function Kill-Port([int]$Port) {
  $pids = @()
  try {
    $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
    $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
  } catch { }
  foreach ($pid in $pids) {
    try { Stop-Process -Id $pid -Force -ErrorAction Stop } catch { }
  }
}

if (-not $env:E2E_STUDENT_TOKEN -or $env:E2E_STUDENT_TOKEN.Trim().Length -lt 10) {
  Write-Host "E2E_STUDENT_TOKEN is missing. Example:" -ForegroundColor Yellow
  Write-Host '$env:E2E_STUDENT_TOKEN="PASTE_TOKEN_HERE"' -ForegroundColor Yellow
  exit 1
}

# Prevent EADDRINUSE (Next dev server / Playwright webServer)
Kill-Port 3000

$pwFlags = @("--project=$Project")
if ($Headed) { $pwFlags += "--headed" }
$pwFlags += @("--workers=1", "tests/e2e-student-complete-path.spec.ts")

Write-Host "Running: npx playwright test $($pwFlags -join ' ')" -ForegroundColor Cyan
npx playwright test @pwFlags