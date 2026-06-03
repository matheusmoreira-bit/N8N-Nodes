#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SAP_DIR="$ROOT_DIR/n8n-nodes-master-nodes-ERPSAPB1"
PAGCORP_DIR="$ROOT_DIR/n8n-nodes-master-pagcorp"
BE_COMPLIANCE_DIR="$ROOT_DIR/n8n-nodes-be-compliance"
SAP_HANA_DIR="$ROOT_DIR/n8n-nodes-sap-hana-data"
OMIE_DIR="$ROOT_DIR/n8n-nodes-omie"
ACCESSTAGE_DIR="$ROOT_DIR/n8n-nodes-accesstage"
UBER_DIR="$ROOT_DIR/n8n-nodes-uber"
COMPOSE_FILE="$ROOT_DIR/docker-compose.custom.yml"
N8N_VOLUME="${N8N_VOLUME:-n8n_data}"

function ensureN8nDataVolume() {
    echo "Checking persistent n8n Docker volume '${N8N_VOLUME}'..."

    if ! docker volume inspect "$N8N_VOLUME" >/dev/null 2>&1; then
        cat <<EOF
ERROR: Docker volume '${N8N_VOLUME}' was not found.

Deploy aborted to avoid starting n8n with an empty data volume.
If this is your first setup, create the volume explicitly:
  docker volume create ${N8N_VOLUME}

If your data is in another volume, rerun with:
  N8N_VOLUME=<existing-volume-name> ./up-custom-nodes.sh
EOF
        exit 1
    fi
}

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
buildNode "$ACCESSTAGE_DIR" "Accesstage APUS"
buildNode "$UBER_DIR" "Uber SFTP"

echo "Starting n8n with all custom nodes..."
cd "$ROOT_DIR"
ensureN8nDataVolume
docker compose -f "$COMPOSE_FILE" up --build -d

echo "Done. Open http://localhost:5678"
