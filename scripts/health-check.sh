#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${BASE_URL:-http://localhost}"
curl -fsS "$BASE_URL/users/health"
curl -fsS "$BASE_URL/products/health"
curl -fsS "$BASE_URL/orders/health"
echo "All health endpoints passed."
