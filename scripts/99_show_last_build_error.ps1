$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path ".").Path

$latest = Get-ChildItem -Path $repoRoot -Recurse -File -Filter "build_*_err.log" -ErrorAction SilentlyContinue |
          Sort-Object LastWriteTime -Descending |
          Select-Object -First 1

if ($null -eq $latest) {
  Write-Host "No build_*_err.log found under: $repoRoot" -ForegroundColor Red
  exit 1
}

Write-Host "=== LAST BUILD ERROR: $($latest.FullName) ===" -ForegroundColor Yellow
Get-Content -LiteralPath $latest.FullName -Encoding UTF8 -Tail 260
Write-Host "=== END LAST BUILD ERROR ===" -ForegroundColor Yellow
