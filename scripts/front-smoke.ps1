# scripts/front-smoke.ps1
# Quick backend smoke from the frontend repo (uses your .env.local)
$api = 'http://127.0.0.1:10003'

# 1) ping
'== ping ==' 
Invoke-RestMethod -Method Get -Uri "$api/ping" | ConvertTo-Json

# 2) login
'== login =='
$body = @{ email='owner@example.com'; password='ChangeMe123?' } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri "$api/api/auth/login" -ContentType 'application/json' -Body $body
$login | ConvertTo-Json

# 3) whoAmI
'== whoami =='
$H = @{ Authorization = "Bearer $($login.token)" }
Invoke-RestMethod -Method Get -Uri "$api/api/auth/whoami" -Headers $H | ConvertTo-Json
