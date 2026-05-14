$ErrorActionPreference = "Stop"

$RootDir = $PSScriptRoot
Set-Location $RootDir

Write-Host "Stopping n8n custom container..." -ForegroundColor Yellow
docker compose -f docker-compose.custom.yml down

Write-Host "Stopped and removed containers." -ForegroundColor Green
