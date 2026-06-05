$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $repoRoot ".docker.env"

if (-not (Test-Path $envFile)) {
    throw "Falta .docker.env. Ejecuta: Copy-Item .env.docker.example .docker.env"
}

Push-Location $repoRoot
try {
    docker compose --env-file .docker.env up --build -d
    docker compose --env-file .docker.env ps
}
finally {
    Pop-Location
}
