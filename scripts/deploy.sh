#!/usr/bin/env bash
set -euo pipefail
cd /opt/microservices
aws ecr get-login-password --region "${AWS_REGION:-ap-south-1}" | docker login --username AWS --password-stdin "${ECR_REGISTRY}"
docker compose pull
docker compose up -d
docker compose ps
