$ErrorActionPreference = "Stop"

# Detect duplicate Next.js App Router pages: same folder has page.js AND page.jsx etc.
$pages = Get-ChildItem -Recurse -File -Path .\app -Filter "page.*" |
  Where-Object { $_.FullName -match "\\app\\" }

$groups = $pages | Group-Object { $_.DirectoryName }

$dupes = @()
foreach ($g in $groups) {
  $names = $g.Group | ForEach-Object { $_.Name }
  if ($names.Count -gt 1) {
    $dupes += [PSCustomObject]@{
      Folder = $g.Name
      Files  = ($names -join ", ")
    }
  }
}

if ($dupes.Count -gt 0) {
  Write-Host "❌ Duplicate Next.js pages found (one route folder must have only ONE page.*):" -ForegroundColor Red
  $dupes | Format-Table -AutoSize | Out-String | Write-Host
  exit 1
}

Write-Host "✅ No duplicate route pages detected." -ForegroundColor Green
