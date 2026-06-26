$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { New-Item -ItemType Directory -Force -Path $Path | Out-Null }
}

function Write-Utf8NoBom([string]$Path, [string]$Content) {
  $dir = Split-Path -Parent $Path
  Ensure-Dir $dir
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

$RepoRoot = (Resolve-Path ".").Path
$AppRoot  = Join-Path $RepoRoot "app"
$proxyDir = Join-Path $AppRoot "api\[...path]"
$proxyPath = Join-Path $proxyDir "route.ts"

if (-not (Test-Path $proxyPath)) {
  throw "Missing $proxyPath"
}

Write-Host "[OK] Proxy route exists: app/api/[...path]/route.ts" -ForegroundColor Green