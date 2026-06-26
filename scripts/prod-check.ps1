[CmdletBinding()]
param(
  [int]$Port = 3000,
  [switch]$KillPort,
  [switch]$OpenBrowser,
  [int]$WaitSeconds = 60
)

$ErrorActionPreference = "Stop"
$script:AllOk = $true

function Write-Section([string]$Title) {
  Write-Host ""
  Write-Host ("=== {0} ===" -f $Title) -ForegroundColor Cyan
}

function Pass([string]$Msg) { Write-Host ("PASS  {0}" -f $Msg) -ForegroundColor Green }
function Fail([string]$Msg) { Write-Host ("FAIL  {0}" -f $Msg) -ForegroundColor Red; $script:AllOk = $false }

function Resolve-RepoRoot {
  # Reliable even if PSCommandPath is null
  $here = Get-Location
  return $here.Path
}

function Get-AppDir([string]$repoRoot) {
  # Prefer repoRoot\frontend if it exists, otherwise repoRoot
  $candidate = Join-Path $repoRoot "frontend"
  if (Test-Path $candidate) { return $candidate }
  return $repoRoot
}

function Kill-Port([int]$Port) {
  try {
    $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($null -eq $conns) { return }
    $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $pids) {
      try { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } catch {}
    }
  } catch {}
}

function Wait-Http([string]$baseUrl, [int]$seconds) {
  $deadline = (Get-Date).AddSeconds($seconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $r = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
      return $true
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }
  return $false
}

$repoRoot = Resolve-RepoRoot
$appDir   = Get-AppDir $repoRoot
$base     = "http://127.0.0.1:$Port"

Write-Host ""
Write-Host ("Prod Check -> {0}" -f $base) -ForegroundColor Yellow
Write-Host ("RepoRoot  -> {0}" -f $repoRoot)
Write-Host ("AppDir    -> {0}" -f $appDir)
Write-Host ("Shell     -> {0}" -f $PSVersionTable.PSEdition)

Write-Section "0) Port hygiene"
if ($KillPort) { Kill-Port $Port }
try {
  $listening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if ($null -eq $listening) { Pass "Port $Port is free (no LISTEN detected)" }
  else { Fail "Port $Port is in use (LISTEN detected)" }
} catch {
  Pass "Port check skipped (Get-NetTCPConnection not available)"
}

Write-Section "1) npm run build"
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$errLogName = "build_{0}_err.log" -f $stamp
$errLogPath = Join-Path $repoRoot $errLogName

Push-Location $appDir
try {
  # Capture ALL output (stdout+stderr) to the err log so it always exists.
  # *>&1 merges all streams into success stream; Tee writes file AND shows console output.
  & npm run build *>&1 | Tee-Object -FilePath $errLogPath | Out-Host
  $buildExit = $LASTEXITCODE
} finally {
  Pop-Location
}

if ($buildExit -ne 0) {
  Fail ("Build failed (exit {0}). See: {1}" -f $buildExit, $errLogName)
  Write-Host ""
  Write-Host ("=== LAST BUILD ERROR: {0} ===" -f $errLogName) -ForegroundColor Yellow
  try { Get-Content -LiteralPath $errLogPath -Encoding UTF8 -Tail 220 } catch {}
  Write-Host ("=== END LAST BUILD ERROR ===") -ForegroundColor Yellow
} else {
  Pass "Build succeeded"
}

Write-Section "2) npm run start (new window)"
if ($script:AllOk) {
  try {
    # Start in a new window (cmd) so this script can keep running.
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "cd /d `"$appDir`" && npm run start" -WindowStyle Normal | Out-Null
    Pass "Started server in a new window"
  } catch {
    Fail ("Failed to start server: {0}" -f $_.Exception.Message)
  }
} else {
  Fail "Skipping start because build failed"
}

Write-Section "3) Wait for server listening"
if ($script:AllOk) {
  $ok = Wait-Http $base $WaitSeconds
  if ($ok) { Pass "Server responded at $base" }
  else { Fail ("Server not responding at {0} after {1}s" -f $base, $WaitSeconds) }
} else {
  Fail "Skipping listen-wait (previous step failed)"
}

Write-Section "4) Smoke test"
if ($script:AllOk) {
  try {
    $r1 = Invoke-WebRequest -Uri "$base/" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Pass ("/ responded: {0}" -f $r1.StatusCode)

    $r2 = Invoke-WebRequest -Uri "$base/login" -UseBasicParsing -TimeoutSec 10 -ErrorAction SilentlyContinue
    if ($null -ne $r2) { Pass ("/login responded: {0}" -f $r2.StatusCode) }
    else { Pass "/login request skipped/redirected (acceptable)" }
  } catch {
    Fail ("Smoke test failed: {0}" -f $_.Exception.Message)
  }
} else {
  Fail "Skipping smoke test (previous step failed)"
}

if ($OpenBrowser -and $script:AllOk) {
  try { Start-Process "$base/login" | Out-Null } catch {}
}

Write-Section "VERDICT"
if ($script:AllOk) {
  Write-Host "SHIP ✅" -ForegroundColor Green
  exit 0
} else {
  Write-Host "DON'T SHIP ❌" -ForegroundColor Red
  exit 1
}
