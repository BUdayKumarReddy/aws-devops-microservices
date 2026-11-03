#!/usr/bin/env bash
set -euo pipefail
# Set USER_IMAGE, PRODUCT_IMAGE and ORDER_IMAGE in /opt/microservices/.env
# to a previously approved version tag, then run:
cd /opt/microservices
docker compose pull
docker compose up -d
docker compose ps
