param(
  [Parameter(Mandatory=$true)]
  [int]$Port
)

$ErrorActionPreference = "Stop"

try {
  $conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($null -ne $conn) {
    $processId = $conn.OwningProcess
    Write-Host "Killing PID $processId on port $Port..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 350
  } else {
    Write-Host "Port $Port is free." -ForegroundColor Green
  }
}
catch {
  Write-Host "stop-port.ps1 error: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
