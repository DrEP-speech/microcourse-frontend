param(
  [string]$HostName = "127.0.0.1",
  [int]$Port = 3000,
  [int]$TimeoutSeconds = 20
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Write-Section([string]$title) {
  Write-Host ""
  Write-Host "=== $title ===" -ForegroundColor Cyan
}

function Pass([string]$msg) { Write-Host "PASS  $msg" -ForegroundColor Green }
function Fail([string]$msg) { Write-Host "FAIL  $msg" -ForegroundColor Red }

function Wait-ForPort {
  param(
    [string]$ComputerName,
    [int]$Port,
    [int]$TimeoutSeconds
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $ok = Test-NetConnection -ComputerName $ComputerName -Port $Port -WarningAction SilentlyContinue
      if ($ok -and $ok.TcpTestSucceeded) { return $true }
    } catch { }
    Start-Sleep -Milliseconds 300
  }
  return $false
}

function Get-HttpMeta {
  param(
    [Parameter(Mandatory=$true)][string]$Url
  )

  try {
    $resp = Invoke-WebRequest -Uri $Url -Method Get -MaximumRedirection 0 -UseBasicParsing -ErrorAction SilentlyContinue
    return [pscustomobject]@{
      Status   = [int]$resp.StatusCode
      Location = $resp.Headers["Location"]
      Error    = $null
    }
  } catch {
    $ex = $_.Exception
    $r = $ex.Response
    $status = $null
    $loc = $null

    try {
      if ($r -and $r.StatusCode) { $status = [int]$r.StatusCode }
      if ($r -and $r.Headers) { $loc = $r.Headers["Location"] }
    } catch { }

    return [pscustomobject]@{
      Status   = $status
      Location = $loc
      Error    = $ex.Message
    }
  }
}

$base = "http://${HostName}:${Port}"

Write-Host ""
Write-Host "Smoke Test -> $base" -ForegroundColor Yellow

$allOk = $true

Write-Section "1) Server Listening"
if (Wait-ForPort -ComputerName $HostName -Port $Port -TimeoutSeconds $TimeoutSeconds) {
  Pass "TCP ${HostName}:${Port} is accepting connections"
} else {
  Fail "TCP ${HostName}:${Port} is NOT accepting connections (start the app first: npm run start)"
  $allOk = $false
}

Write-Section "2) Redirect Check: /auth/login -> /login"
if ($allOk) {
  $r = Get-HttpMeta -Url "$base/auth/login"

  if (($r.Status -ge 300 -and $r.Status -lt 400) -and ($r.Location -match '^/login(\b|$)')) {
    Pass "/auth/login returned $($r.Status) and Location: $($r.Location)"
  } else {
    $extra = ""
    if ($r.Error) { $extra = " (detail: $($r.Error))" }
    Fail "/auth/login expected 3xx redirect to /login, got Status=$($r.Status) Location='$($r.Location)'$extra"
    $allOk = $false
  }
}

Write-Section "3) Page Check: /login returns 200"
if ($allOk) {
  $r2 = Get-HttpMeta -Url "$base/login"

  if ($r2.Status -eq 200) {
    Pass "/login returned 200"
  } else {
    $extra2 = ""
    if ($r2.Error) { $extra2 = " (detail: $($r2.Error))" }
    Fail "/login expected 200, got Status=$($r2.Status) Location='$($r2.Location)'$extra2"
    $allOk = $false
  }
}

Write-Section "RESULT"
if ($allOk) {
  Write-Host "✅ ALL CHECKS PASSED" -ForegroundColor Green
  exit 0
} else {
  Write-Host "❌ ONE OR MORE CHECKS FAILED" -ForegroundColor Red
  exit 1
}
