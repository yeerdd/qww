param(
  [string]$StateJson = "data/personal-state.json",
  [string]$StateScript = "data/personal-state.js"
)

$ErrorActionPreference = "Stop"

function Resolve-ProjectPath {
  param([string]$Path)
  if ([System.IO.Path]::IsPathRooted($Path)) {
    return $Path
  }
  return Join-Path (Resolve-Path ".").Path $Path
}

$jsonPath = Resolve-ProjectPath -Path $StateJson
$scriptPath = Resolve-ProjectPath -Path $StateScript

if (-not (Test-Path $jsonPath)) {
  throw "State JSON file was not found: $jsonPath"
}

$payload = Get-Content -Raw -Path $jsonPath | ConvertFrom-Json
if (-not $payload -or -not $payload.repositories) {
  throw "State JSON must contain a repositories object."
}

$state = [ordered]@{
  version = if ($payload.version) { $payload.version } else { 1 }
  updatedAt = if ($payload.updatedAt) { $payload.updatedAt } else { (Get-Date).ToString("o") }
  repositories = $payload.repositories
}

$outputDir = Split-Path $scriptPath -Parent
if (-not (Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir | Out-Null
}

$json = $state | ConvertTo-Json -Depth 10
"window.REPO_NAV_PERSONAL_STATE = $json;" | Set-Content -Path $scriptPath -Encoding UTF8
Write-Host "Wrote $scriptPath"
