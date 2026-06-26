param(
  [switch]$ApplyFixes
)

$ErrorActionPreference = "Stop"

function Write-Section([string]$Title) {
  Write-Host ""
  Write-Host ("=== " + $Title + " ===") -ForegroundColor Cyan
}

function Ensure-Dir([string]$Path) {
  if (-not (Test-Path $Path)) { New-Item -ItemType Directory -Force -Path $Path | Out-Null }
}

function Write-FileUtf8([string]$Path, [string[]]$Lines) {
  $dir = Split-Path $Path -Parent
  Ensure-Dir $dir
  Set-Content -Path $Path -Value $Lines -Encoding UTF8
}

function Resolve-Cmd([string]$Tool) {
  $cmd = (Get-Command $Tool -ErrorAction Stop).Source
  # If we're pointed at npm.ps1/npx.ps1, prefer sibling .cmd when available (more predictable)
  if ($cmd -like "*.ps1") {
    $cmdCandidate = [System.IO.Path]::ChangeExtension($cmd, ".cmd")
    if (Test-Path $cmdCandidate) { return $cmdCandidate }
  }
  return $cmd
}

function Run-Tool([string]$Tool, [string[]]$Args, [string]$StdOutPath, [string]$StdErrPath) {
  Ensure-Dir (Split-Path $StdOutPath -Parent)
  Ensure-Dir (Split-Path $StdErrPath -Parent)

  try {
    $exe = Resolve-Cmd $Tool

    # If it’s a .cmd, execute via cmd /c to avoid Win32/app issues
    if ($exe -like "*.cmd") {
      $argLine = ($Args | ForEach-Object { if ($_ -match '\s') { '"' + $_ + '"' } else { $_ } }) -join " "
      cmd /c "`"$exe`" $argLine" 1> $StdOutPath 2> $StdErrPath
      return $LASTEXITCODE
    }

    # Otherwise execute directly
    & $exe @Args 1> $StdOutPath 2> $StdErrPath
    return $LASTEXITCODE
  }
  catch {
    ("RUNNER_ERROR: " + $_.Exception.Message) | Out-File -FilePath $StdErrPath -Encoding UTF8
    return 1
  }
}

function Patch-Text([string]$Path, [scriptblock]$Transform) {
  if (-not (Test-Path $Path)) { return $false }
  $orig = Get-Content $Path -Raw -Encoding UTF8
  $next = & $Transform $orig
  if ($null -eq $next) { return $false }
  if ($next -ne $orig) {
    Set-Content -Path $Path -Value $next -Encoding UTF8
    return $true
  }
  return $false
}

# Project root = parent of /scripts
$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $ProjectRoot

Ensure-Dir ".\scripts"
Ensure-Dir ".\reports"
Ensure-Dir ".\lib"
Ensure-Dir ".\app\_lib"
Ensure-Dir ".\src\lib"
Ensure-Dir ".\src\app"

Write-Section "0) Sanity: show tool paths"
try { Write-Host ("node: " + (Get-Command node).Source) -ForegroundColor Green } catch { Write-Host "node not found" -ForegroundColor Yellow }
try { Write-Host ("npm : " + (Get-Command npm ).Source) -ForegroundColor Green } catch { Write-Host "npm not found"  -ForegroundColor Yellow }
try { Write-Host ("npx : " + (Get-Command npx ).Source) -ForegroundColor Green } catch { Write-Host "npx not found"  -ForegroundColor Yellow }

if ($ApplyFixes) {
  Write-Section "1) Apply permanent TypeScript-safe apiFetch + auth exports"

  Write-FileUtf8 ".\lib\api.ts" @(
    "export type ApiFetchOptions<TBody = unknown> = Omit<RequestInit, 'body' | 'headers'> & {",
    "  body?: TBody;",
    "  headers?: HeadersInit;",
    "};",
    "",
    "function isPlainObject(value: unknown): value is Record<string, unknown> {",
    "  if (!value || typeof value !== 'object') return false;",
    "  if (value instanceof FormData) return false;",
    "  if (value instanceof URLSearchParams) return false;",
    "  if (value instanceof Blob) return false;",
    "  if (value instanceof ArrayBuffer) return false;",
    "  return Object.prototype.toString.call(value) === '[object Object]';",
    "}",
    "",
    "export async function apiFetch<TResponse = unknown, TBody = unknown>(",
    "  path: string,",
    "  options: ApiFetchOptions<TBody> = {}",
    "): Promise<TResponse> {",
    "  const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';",
    "  const url = path.startsWith('http')",
    "    ? path",
    "    : base",
    "      ? (base.replace(/\\/$/, '') + (path.startsWith('/') ? path : '/' + path))",
    "      : path;",
    "",
    "  const { body, headers, ...rest } = options;",
    "  const finalHeaders: Record<string, string> = {};",
    "  if (headers) {",
    "    const h = new Headers(headers);",
    "    h.forEach((v, k) => { finalHeaders[k] = v; });",
    "  }",
    "",
    "  let finalBody: BodyInit | undefined = undefined;",
    "  if (typeof body !== 'undefined') {",
    "    if (body instanceof FormData) {",
    "      finalBody = body;",
    "      if (finalHeaders['content-type']) delete finalHeaders['content-type'];",
    "    } else if (body instanceof URLSearchParams) {",
    "      finalBody = body;",
    "    } else if (typeof body === 'string') {",
    "      finalBody = body;",
    "    } else if (body instanceof Blob) {",
    "      finalBody = body;",
    "    } else if (body instanceof ArrayBuffer) {",
    "      finalBody = body as unknown as BodyInit;",
    "    } else if (isPlainObject(body) || Array.isArray(body)) {",
    "      finalBody = JSON.stringify(body);",
    "      if (!finalHeaders['content-type']) finalHeaders['content-type'] = 'application/json';",
    "    } else {",
    "      finalBody = JSON.stringify(body);",
    "      if (!finalHeaders['content-type']) finalHeaders['content-type'] = 'application/json';",
    "    }",
    "  }",
    "",
    "  const res = await fetch(url, { ...rest, headers: finalHeaders, body: finalBody });",
    "  const contentType = res.headers.get('content-type') || '';",
    "  const raw = await res.text();",
    "",
    "  let data: any = raw;",
    "  if (raw && contentType.includes('application/json')) {",
    "    try { data = JSON.parse(raw); } catch { /* ignore */ }",
    "  }",
    "",
    "  if (!res.ok) {",
    "    const msg = (data && (data.message || data.error)) ? (data.message || data.error) : res.statusText;",
    "    throw new Error(`API ${res.status}: ${msg}`);",
    "  }",
    "",
    "  return data as TResponse;",
    "}",
    "",
    "export const api = {",
    "  get: <T = unknown>(p: string, opts: ApiFetchOptions = {}) => apiFetch<T>(p, { ...opts, method: 'GET' }),",
    "  post: <T = unknown, B = unknown>(p: string, body?: B, opts: ApiFetchOptions<B> = {}) =>",
    "    apiFetch<T, B>(p, { ...opts, method: 'POST', body }),",
    "  put: <T = unknown, B = unknown>(p: string, body?: B, opts: ApiFetchOptions<B> = {}) =>",
    "    apiFetch<T, B>(p, { ...opts, method: 'PUT', body }),",
    "  del: <T = unknown>(p: string, opts: ApiFetchOptions = {}) => apiFetch<T>(p, { ...opts, method: 'DELETE' }),",
    "};"
  )

  Write-FileUtf8 ".\lib\auth.ts" @(
    "const KEY = 'token';",
    "",
    "export function setToken(token: string) {",
    "  if (typeof window === 'undefined') return;",
    "  window.localStorage.setItem(KEY, token);",
    "}",
    "",
    "export function getToken(): string | null {",
    "  if (typeof window === 'undefined') return null;",
    "  return window.localStorage.getItem(KEY);",
    "}",
    "",
    "export function clearToken() {",
    "  if (typeof window === 'undefined') return;",
    "  window.localStorage.removeItem(KEY);",
    "}"
  )

  Write-FileUtf8 ".\app\_lib\api.ts" @("export * from '../../lib/api';")
  Write-FileUtf8 ".\src\lib\apiClient.ts" @("export * from '../../lib/api';")

  Write-Section "2) Patch login page import (supports app/ and src/app/)"
  $loginCandidates = @(
    ".\app\login\page.tsx",
    ".\src\app\login\page.tsx"
  )

  $anyPatched = $false
  foreach ($p in $loginCandidates) {
    $patched = Patch-Text $p {
      param($c)

      $c2 = [regex]::Replace(
        $c,
        "import\\s*\\{\\s*apiFetch\\s*\\}\\s*from\\s*['""][^'""]+['""];",
        "import { apiFetch } from `"..\\..\\lib\\api`";"
      )

      if ($c2 -eq $c) {
        if ($c -match "^[ \\t]*'use client';") {
          $c2 = $c -replace "^[ \\t]*'use client';\\s*\\r?\\n", "'use client';`r`nimport { apiFetch } from `"..\\..\\lib\\api`";`r`n"
        } else {
          $c2 = "import { apiFetch } from `"..\\..\\lib\\api`";`r`n" + $c
        }
      }

      return $c2
    }

    if ($patched) {
      Write-Host ("Patched: " + $p) -ForegroundColor Green
      $anyPatched = $true
    } else {
      Write-Host ("No changes: " + $p + " (missing or already ok)") -ForegroundColor Yellow
    }
  }

  if (-not $anyPatched) {
    Write-Host "Login file not found in app/ or src/app/. We'll still run type-check and build." -ForegroundColor Yellow
  }
}

Write-Section "3) Type-check (npm exec tsc -- --noEmit)"
$tscOut = ".\reports\tsc_stdout.txt"
$tscErr = ".\reports\tsc_stderr.txt"
$tscExit = Run-Tool "npm" @("exec","--","tsc","--noEmit") $tscOut $tscErr
Write-Host ("tsc exit: " + $tscExit) -ForegroundColor Cyan

Write-Section "4) Next build (npm run build)"
$buildOut = ".\reports\build_stdout.txt"
$buildErr = ".\reports\build_stderr.txt"
$buildExit = Run-Tool "npm" @("run","build") $buildOut $buildErr
Write-Host ("build exit: " + $buildExit) -ForegroundColor Cyan

Write-Host ""
Write-Host "Reports saved in .\reports\ (paste build_stderr.txt if anything fails)" -ForegroundColor Cyan

exit $buildExit
