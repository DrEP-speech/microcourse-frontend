param(
  [string]$AppRoot = (Join-Path (Get-Location).Path "app")
)

function Ensure-Dir([string]$DirPath) {
  if (!(Test-Path -LiteralPath $DirPath)) {
    New-Item -ItemType Directory -Path $DirPath | Out-Null
  }
}

function Remove-DuplicatePagesInDir([string]$DirPath) {
  # IMPORTANT: -LiteralPath so [quizId] isn't treated as a wildcard
  if (!(Test-Path -LiteralPath $DirPath)) { return }

  $pages = Get-ChildItem -LiteralPath $DirPath -File -Filter "page.*" -ErrorAction SilentlyContinue
  if (!$pages -or $pages.Count -le 1) { return }

  # Keep best file preference order
  $keepOrder = @("page.tsx", "page.jsx", "page.ts", "page.js")

  $keep = $null
  foreach ($name in $keepOrder) {
    $match = $pages | Where-Object { $_.Name -ieq $name } | Select-Object -First 1
    if ($match) { $keep = $match; break }
  }

  # If none match the preferred list, keep the first one deterministically
  if (-not $keep) {
    $keep = $pages | Sort-Object Name | Select-Object -First 1
  }

  $toRemove = $pages | Where-Object { $_.FullName -ne $keep.FullName }

  foreach ($f in $toRemove) {
    Remove-Item -LiteralPath $f.FullName -Force -ErrorAction SilentlyContinue
  }

  Write-Host ("[OK] " + $DirPath + " -> kept " + $keep.Name + ", removed " + $toRemove.Count) -ForegroundColor Green
}

function Scan-And-Fix([string]$Root) {
  if (!(Test-Path -LiteralPath $Root)) {
    throw "AppRoot not found: $Root"
  }

  # Fix root itself (in case app/page.* duplicates exist)
  Remove-DuplicatePagesInDir -DirPath $Root

  # Walk every folder under /app and fix any folder containing multiple page.*
  $dirs = Get-ChildItem -LiteralPath $Root -Directory -Recurse -ErrorAction SilentlyContinue
  foreach ($d in $dirs) {
    Remove-DuplicatePagesInDir -DirPath $d.FullName
  }
}

Scan-And-Fix -Root $AppRoot
Write-Host "[DONE] Duplicate page.* cleanup completed." -ForegroundColor Cyan