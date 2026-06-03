$ErrorActionPreference = "Stop"

function Build-Node($path, $name) {
    if (-not (Test-Path $path)) {
        Write-Host "[DEBUG] Procurando por '$path'. Caminho completo: $(Resolve-Path $path -ErrorAction Silently)" -ForegroundColor Gray
        throw "Erro: Diretorio '$path' nao encontrado para o no $name."
    }

    Write-Host "`n--- building $name ---" -ForegroundColor Cyan
    Set-Location $path
    
    # DEBUG: Mostrar onde estamos e o que tem na pasta
    Write-Host "[DEBUG] No diretorio: $((Get-Location).Path)" -ForegroundColor Gray
    if (-not (Test-Path "package.json")) {
        Write-Host "[DEBUG] package.json NAO ENCONTRADO em $((Get-Location).Path)" -ForegroundColor Red
        Write-Host "[DEBUG] Arquivos na pasta:" -ForegroundColor Gray
        Get-ChildItem | Select-Object Name | Out-String | Write-Host
    }

    # Tenta rodar o build. Se falhar, tenta instalar dependencias e rodar de novo.
    Write-Host "Executando npm run build para $name..." -ForegroundColor Gray
    $null = npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build inicial falhou. Tentando rodar npm install para corrigir dependencias..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) { throw "Falha no npm install para $name" }
        
        Write-Host "Tentando build novamente para $name..." -ForegroundColor Gray
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "Falha no build para $name apos npm install" }
    }
}

# Pega o diretorio onde o script esta localizado
$RootDir = $PSScriptRoot
$SapDir = Join-Path $RootDir "n8n-nodes-master-nodes-ERPSAPB1"
$PagCorpDir = Join-Path $RootDir "n8n-nodes-master-pagcorp"
$BeComplianceDir = Join-Path $RootDir "n8n-nodes-be-compliance"
$SapHanaDir = Join-Path $RootDir "n8n-nodes-sap-hana-data"
$OmieDir = Join-Path $RootDir "n8n-nodes-omie"
$AccesstageDir = Join-Path $RootDir "n8n-nodes-accesstage"
$UberDir = Join-Path $RootDir "n8n-nodes-uber"
$ComposeFile = Join-Path $RootDir "docker-compose.custom.yml"
$N8nVolume = if ($env:N8N_VOLUME) { $env:N8N_VOLUME } else { "n8n_data" }

function Assert-N8nDataVolume($volumeName) {
    Write-Host "Checking persistent n8n Docker volume '$volumeName'..." -ForegroundColor Gray

    docker volume inspect $volumeName *> $null
    if ($LASTEXITCODE -ne 0) {
        throw @"
Docker volume '$volumeName' was not found.

Deploy aborted to avoid starting n8n with an empty data volume.
If this is your first setup, create the volume explicitly:
  docker volume create $volumeName

If your data is in another volume, rerun with:
  `$env:N8N_VOLUME = "<existing-volume-name>"; .\up-custom-nodes.ps1
"@
    }
}

try {
    Build-Node $SapDir "SAP B1"
    Build-Node $PagCorpDir "PagCorp"
    Build-Node $BeComplianceDir "Be Compliance"
    Build-Node $OmieDir "Omie"
    Build-Node $AccesstageDir "Accesstage APUS"
    Build-Node $UberDir "Uber SFTP"
    # Build-Node $SapHanaDir "SAP HANA Data" # Ignorado a pedido do usuario

    Write-Host "`n--- Starting n8n with all custom nodes ---" -ForegroundColor Green
    Set-Location $RootDir

    Assert-N8nDataVolume $N8nVolume

    # O comando --build garante que a imagem customizada seja recriada com os novos dist/
    docker compose -f $ComposeFile up --build -d

    if ($LASTEXITCODE -ne 0) { throw "Falha ao subir o Docker Compose" }

    Write-Host "`nDone. Open http://localhost:5678" -ForegroundColor Green
    Write-Host "Nota: Seus dados estao no volume Docker 'n8n_data' definido no compose file." -ForegroundColor Gray
}
catch {
    Write-Host "`n[ERRO] Ocorreu um problema durante a execucao:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
