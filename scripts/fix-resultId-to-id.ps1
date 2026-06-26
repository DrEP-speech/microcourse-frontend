param(
  [string]$root = "src/app",
  [string]$from = "resultId",
  [string]$to   = "id"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $root)) {
  Write-Host "No $root directory found." -ForegroundColor Yellow
  exit 0
}

# 1) Rename folders [resultId] -> [id]
$targets = Get-ChildItem -Path $root -Recurse -Directory | Where-Object { $_.Name -match "^\[$from\]$" }
if ($targets.Count -eq 0) {
  Write-Host "No [$from] folders found under $root." -ForegroundColor Yellow
} else {
  foreach ($dir in $targets) {
    $newName = "[$to]"
    Write-Host ("Renaming {0} -> {1}" -f $dir.FullName, (Join-Path $dir.Parent.FullName $newName)) -ForegroundColor Yellow
    Rename-Item -LiteralPath $dir.FullName -NewName $newName
  }
}

# 2) Update file references: params.resultId -> params.id and common TS/object patterns
$extensions = @("*.ts","*.tsx","*.js","*.jsx")
$files = Get-ChildItem -Path . -Recurse -File -Include $extensions
if ($files.Count -eq 0) {
  Write-Host "No code files to update." -ForegroundColor Yellow
  exit 0
}

$backup = ".route-refactors/fix-$($from)-to-$($to)-$(Get-Date -Format yyyyMMdd-HHmmss)"
New-Item -ItemType Directory -Force -Path $backup | Out-Null

$patterns = @(
  # params access
  @{ from = "\bparams\.$from\b";                           to = "params.$to" },
  # destructuring forms
  @{ from = "\b\{[^}]*\b$from\b[^}]*\}\s*:\s*params";      to = "{$to}: params" }, # rare
  # simple TS param shapes
  @{ from = "params:\s*\{\s*$from\s*:\s*string\s*\}";      to = "params: { $to: string }" },
  @{ from = "params\?:\s*\{\s*$from\s*:\s*string\s*\}";    to = "params?: { $to: string }" },
  # object literals (e.g., { resultId } becomes { id })
  @{ from = "(\{[^}]*?)\b$from\b([^}]*\})";                to = '$1' + "$to" + '$2' }
)

foreach ($f in $files) {
  $text = Get-Content -Raw -Encoding UTF8 $f.FullName
  $orig = $text
  foreach ($p in $patterns) {
    $text = [regex]::Replace($text, $p.from, $p.to)
  }
  if ($text -ne $orig) {
    $rel = Resolve-Path -LiteralPath $f.FullName | Split-Path -NoQualifier
    $dest = Join-Path $backup ($rel.TrimStart("\","/"))
    New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
    Copy-Item -LiteralPath $f.FullName -Destination $dest -Force
    Set-Content -Encoding UTF8 -NoNewline $f.FullName $text
    Write-Host ("Updated {0}" -f $f.FullName) -ForegroundColor Green
  }
}

Write-Host "Done. Backup at $backup" -ForegroundColor Green
