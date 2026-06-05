$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $repoRoot ".docker.env"

if (-not (Test-Path $envFile)) {
    throw "Falta .docker.env. Ejecuta: Copy-Item .env.docker.example .docker.env"
}

Push-Location $repoRoot
try {
    docker compose --env-file .docker.env down
}
finally {
    Pop-Location
}
