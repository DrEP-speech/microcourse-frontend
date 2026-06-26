param([int]$Port)
$tcp = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($tcp) {
  try { Stop-Process -Id $tcp.OwningProcess -Force; Write-Host ("Freed port {0} (PID {1})" -f $Port,$tcp.OwningProcess) -ForegroundColor Yellow }
  catch { Write-Host ("Could not free port {0}: {1}" -f $Port,$_.Exception.Message) -ForegroundColor Red }
} else { Write-Host ("No listener on port {0}" -f $Port) -ForegroundColor Green }
