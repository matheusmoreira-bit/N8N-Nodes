$ErrorActionPreference = "Stop"

# Pega o diretório onde o script está localizado
$RootDir = $PSScriptRoot
$SapDir = Join-Path $RootDir "n8n-nodes-master-nodes-ERPSAPB1"
$PagCorpDir = Join-Path $RootDir "n8n-nodes-master-pagcorp"
$SapHanaDir = Join-Path $RootDir "n8n-nodes-sap-hana-data"

Write-Host "Building SAP B1 node..." -ForegroundColor Cyan
Set-Location $SapDir
npm run build

Write-Host "Building PagCorp node..." -ForegroundColor Cyan
Set-Location $PagCorpDir
npm run build

Write-Host "Building SAP HANA Data node..." -ForegroundColor Cyan
Set-Location $SapHanaDir
npm run build

Write-Host "Starting n8n with all custom nodes..." -ForegroundColor Green
Set-Location $RootDir

# O comando --build garante que a imagem customizada seja recriada com os novos dist/
docker compose -f docker-compose.custom.yml up --build -d

Write-Host "`nDone. Open http://localhost:5678" -ForegroundColor Green
Write-Host "Nota: Seus dados estão no volume Docker 'n8n_data' definido no compose file." -ForegroundColor Gray
