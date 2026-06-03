#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SAP_DIR="$ROOT_DIR/n8n-nodes-master-nodes-ERPSAPB1"
PAGCORP_DIR="$ROOT_DIR/n8n-nodes-master-pagcorp"
BE_COMPLIANCE_DIR="$ROOT_DIR/n8n-nodes-be-compliance"
SAP_HANA_DIR="$ROOT_DIR/n8n-nodes-sap-hana-data"
OMIE_DIR="$ROOT_DIR/n8n-nodes-omie"

function buildNode() {
    local nodeDir="$1"
    local nodeName="$2"

    echo "Building ${nodeName} node..."
    cd "$nodeDir"

    if ! npm run build; then
        echo "Build failed for ${nodeName}, installing dependencies..."
        npm install
        npm run build
    fi
}

buildNode "$SAP_DIR" "SAP B1"
buildNode "$PAGCORP_DIR" "PagCorp"
buildNode "$BE_COMPLIANCE_DIR" "BeCompliance"
buildNode "$SAP_HANA_DIR" "SAP HANA Data"
buildNode "$OMIE_DIR" "Omie"

echo "Starting n8n with all custom nodes..."
cd "$ROOT_DIR"
docker compose -f docker-compose.custom.yml up --build -d

echo "Done. Open http://localhost:5678"
