$ErrorActionPreference = "Stop"

function Write-TextFile {
  param([Parameter(Mandatory=$true)][string]$Path,
        [Parameter(Mandatory=$true)][string]$Content)

  $dir = Split-Path -Parent $Path
  if ($dir -and !(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  Set-Content -LiteralPath $Path -Value $Content -Encoding UTF8
  Write-Host "Wrote: $Path" -ForegroundColor Green
}

$root = (Get-Location).Path

# --- A) Ensure Next standalone output (required for production artifact packaging) ---
$nextCfg = Join-Path $root "next.config.mjs"
if (!(Test-Path $nextCfg)) {
  Write-TextFile $nextCfg @'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};
export default nextConfig;
