$ErrorActionPreference = "Stop"

$standalone = ".next/standalone"
$standaloneNext = Join-Path $standalone ".next"

if (-not (Test-Path $standalone)) {
  Write-Host "No .next/standalone directory found. Did you run npm run build?" -ForegroundColor Red
  exit 1
}

New-Item -ItemType Directory -Force -Path $standaloneNext | Out-Null

# Copy .next/static -> .next/standalone/.next/static
if (Test-Path ".next/static") {
  $dest = Join-Path $standaloneNext "static"
  New-Item -ItemType Directory -Force -Path $dest | Out-Null
  Copy-Item -Recurse -Force ".next/static/*" $dest
}

# Copy public -> .next/standalone/public
if (Test-Path "public") {
  $pubDest = Join-Path $standalone "public"
  New-Item -ItemType Directory -Force -Path $pubDest | Out-Null
  Copy-Item -Recurse -Force "public/*" $pubDest
}

Write-Host "postbuild complete: standalone assets staged." -ForegroundColor Green
