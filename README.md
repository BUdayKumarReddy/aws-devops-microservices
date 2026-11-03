# AWS DevOps Three-Microservices Starter

This starter provides a small existing application for the DevOps assignment:
- User Service (port 3001)
- Product Service (port 3002)
- Order Service (port 3003)

Application features are intentionally minimal. Use this project to practice Docker, Compose, Nginx, Jenkins, Terraform, ECR, EC2, Prometheus and Grafana.

## Local prerequisites
- Docker Engine/Desktop with Docker Compose
- Git

## Local run
From the repository root:
```bash
docker compose -f docker/docker-compose.yml --env-file docker/.env.example up --build
```
Then test:
- http://localhost/users/health
- http://localhost/products/health
- http://localhost/orders/health

## Important
The Terraform and Jenkins files are starter templates and require account-specific values, secure credentials, region/AMI/key pair details, and careful review before applying. Do not commit real credentials, private keys, .env files, or Terraform state.
