param([int]$Port = [int]($env:PORT ? $env:PORT : 10003))
$ErrorActionPreference = "SilentlyContinue"
Get-NetTCPConnection -LocalPort $Port -State Listen |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { taskkill /PID $_ /F | Out-Null }
