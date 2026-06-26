param([int]$port = 3000)
try {
  $pids = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
          Select-Object -ExpandProperty OwningProcess -Unique
  if ($pids) {
    foreach ($pid in $pids) { try { taskkill /PID $pid /F | Out-Null } catch {} }
    Write-Host "Freed port $port" -ForegroundColor Green
  } else { Write-Host "Port $port was clear" -ForegroundColor Green }
} catch {}
