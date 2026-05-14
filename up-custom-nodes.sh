#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SAP_DIR="$ROOT_DIR/n8n-nodes-master-nodes-ERPSAPB1"
PAGCORP_DIR="$ROOT_DIR/n8n-nodes-master-pagcorp"
SAP_HANA_DIR="$ROOT_DIR/n8n-nodes-sap-hana-data"

echo "Building SAP B1 node..."
cd "$SAP_DIR"
npm run build

echo "Building PagCorp node..."
cd "$PAGCORP_DIR"
npm run build

echo "Building SAP HANA Data node..."
cd "$SAP_HANA_DIR"
npm run build

echo "Starting n8n with all custom nodes..."
cd "$ROOT_DIR"
docker compose -f docker-compose.custom.yml up --build -d

echo "Done. Open http://localhost:5678"
