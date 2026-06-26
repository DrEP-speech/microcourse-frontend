param([string]$root = "src/app")

if (-not (Test-Path $root)) {
  Write-Host "No $root directory found." -ForegroundColor Yellow
  exit 0
}

# Normalize a route path: strip route groups and param names (keep [] but erase inner names)
function Normalize-Route([string]$p) {
  # remove parentheses route groups e.g. (marketing)
  $p = $p -replace "\(.*?\)", ""
  # collapse multiple slashes
  $p = $p -replace "[\\/]+", "/"
  $p = $p.Trim("/")

  # split and normalize dynamic segments to just []
  $segments = @()
  foreach ($seg in ($p -split "/")) {
    if ($seg -match "^\[.+\]$") { $segments += "[]" } else { $segments += $seg }
  }
  if ($segments.Count -eq 0) { return "/" }
  return "/" + ($segments -join "/")
}

# collect dynamic segment names per normalized route
$groups = @{}  # normalized -> HashSet of param names at the last segment
Get-ChildItem -Path $root -Recurse -Directory | ForEach-Object {
  $rel = $_.FullName.Replace((Get-Item $root).FullName, "").Trim("\/")
  if ($rel -eq "") { return }
  # only directories named like [param]
  if ($_.Name -match '^\[(?<name>[A-Za-z0-9_]+)\]$') {
    $norm = Normalize-Route($rel)
    $name = $Matches["name"]
    if (-not $groups.ContainsKey($norm)) {
      $groups[$norm] = New-Object 'System.Collections.Generic.HashSet[string]'
    }
    [void]$groups[$norm].Add($name)
  }
}

if ($groups.Count -eq 0) {
  Write-Host "No dynamic route folders found under $root." -ForegroundColor Yellow
  exit 0
}

$conflicts = @{}
Write-Host "`n== Dynamic segment sets by normalized route ==" -ForegroundColor Cyan
$groups.Keys | Sort-Object | ForEach-Object {
  $vals = @($groups[$_]) | Sort-Object
  Write-Host ("{0,-40} : {1}" -f $_, ($vals -join ", "))
  if ($vals.Count -gt 1) { $conflicts[$_] = $vals }
}

if ($conflicts.Count -gt 0) {
  Write-Host "`nConflicts found (different param names for the same path):" -ForegroundColor Red
  $conflicts.GetEnumerator() | Sort-Object Key | ForEach-Object {
    Write-Host ("  {0} -> {1}" -f $_.Key, (($_.Value) -join ", ")) -ForegroundColor Red
  }
  exit 2
} else {
  Write-Host "`nNo conflicting dynamic param names found." -ForegroundColor Green
}
