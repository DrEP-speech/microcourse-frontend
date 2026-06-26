param(
  [string]$BackendDir = "C:\Users\eddwa\Downloads\microcourse-backend-final-clean",
  [string]$FrontendUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"

$env:MC_BACKEND_DIR = $BackendDir
$env:MC_FRONTEND_URL = $FrontendUrl

Write-Host "[INFO] MC_BACKEND_DIR = $env:MC_BACKEND_DIR"
Write-Host "[INFO] MC_FRONTEND_URL = $env:MC_FRONTEND_URL"

node .\e2e\courses.e2e.mjs
exit $LASTEXITCODE
