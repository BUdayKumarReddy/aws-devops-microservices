pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    AWS_REGION = 'ap-south-2'
    AWS_ACCOUNT_ID = '576406717252'
    IMAGE_TAG = "build-${BUILD_NUMBER}"
    ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    APP_EC2_HOST = '16.113.21.176'
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Validate Compose') {
      steps {
        sh '''
          docker compose \
            -f docker/docker-compose.yml \
            --env-file docker/.env.example config -q
        '''
      }
    }

    stage('Test') {
      steps {
        sh '''
          set -e

          for service in user-service product-service order-service; do
            echo "Testing $service..."
            (cd services/$service && npm test)
          done

          echo "All service tests completed successfully."
        '''
      }
    }

    stage('Build Images') {
      steps {
        sh '''
          set -e

          echo "Building User Service..."
          docker build -t ${ECR_REGISTRY}/user-service:${IMAGE_TAG} services/user-service

          echo "Building Product Service..."
          docker build -t ${ECR_REGISTRY}/product-service:${IMAGE_TAG} services/product-service

          echo "Building Order Service..."
          docker build -t ${ECR_REGISTRY}/order-service:${IMAGE_TAG} services/order-service

          echo "All images built successfully."
        '''
      }
    }

    stage('Push to ECR') {
      steps {
        sh '''
          set -e

          echo "Logging in to AWS ECR..."

          aws ecr get-login-password --region ${AWS_REGION} |
          docker login --username AWS --password-stdin ${ECR_REGISTRY}

          echo "Pushing User Service..."
          docker push ${ECR_REGISTRY}/user-service:${IMAGE_TAG}

          echo "Pushing Product Service..."
          docker push ${ECR_REGISTRY}/product-service:${IMAGE_TAG}

          echo "Pushing Order Service..."
          docker push ${ECR_REGISTRY}/order-service:${IMAGE_TAG}

          echo "All images pushed successfully."
        '''
      }
    }

    stage('Deploy') {
      steps {
        withCredentials([
          sshUserPrivateKey(
            credentialsId: 'app-ec2-ssh-key',
            keyFileVariable: 'SSH_KEY',
            usernameVariable: 'SSH_USER'
          )
        ]) {

          sh '''
            set -e

            echo "Connecting to App EC2..."

            ssh -i "$SSH_KEY" \
              -o StrictHostKeyChecking=no \
              -o UserKnownHostsFile=/dev/null \
              "$SSH_USER@$APP_EC2_HOST" \
              "AWS_REGION='${AWS_REGION}' ECR_REGISTRY='${ECR_REGISTRY}' IMAGE_TAG='${IMAGE_TAG}' bash -s" <<'REMOTE'

set -Eeuo pipefail

cd /home/ubuntu/three-microservices/docker

BACKUP_FILE=".env.rollback-${IMAGE_TAG}"

echo "Creating manual rollback backup..."

sudo cp .env "$BACKUP_FILE"
sudo chmod 600 "$BACKUP_FILE"

echo "Manual rollback backup created: $BACKUP_FILE"

echo "Logging in to ECR..."

sudo aws ecr get-login-password --region "$AWS_REGION" |
sudo docker login --username AWS --password-stdin "$ECR_REGISTRY"

echo "Updating image tags..."

sudo sed -i "s|^USER_IMAGE=.*|USER_IMAGE=${ECR_REGISTRY}/user-service:${IMAGE_TAG}|" .env

sudo sed -i "s|^PRODUCT_IMAGE=.*|PRODUCT_IMAGE=${ECR_REGISTRY}/product-service:${IMAGE_TAG}|" .env

sudo sed -i "s|^ORDER_IMAGE=.*|ORDER_IMAGE=${ECR_REGISTRY}/order-service:${IMAGE_TAG}|" .env

echo "Validating Docker Compose..."

sudo docker compose config -q

echo "Pulling latest images..."

sudo docker compose pull

echo "Deploying containers..."

sudo docker compose up -d --remove-orphans

echo "Waiting for services to initialize..."

sleep 5

echo "Restarting Nginx..."

sudo docker compose restart nginx

echo "Checking application health..."

curl --retry 10 --retry-delay 2 --retry-connrefused -fsS http://localhost/users/health

echo

curl --retry 10 --retry-delay 2 --retry-connrefused -fsS http://localhost/products/health

echo

curl --retry 10 --retry-delay 2 --retry-connrefused -fsS http://localhost/orders/health

echo

echo "All application health checks passed!"

echo "Deployment completed successfully."

echo "Manual rollback backup retained at: $BACKUP_FILE"

REMOTE
          '''
        }
      }
    }
  }

  post {
    success {
      echo 'Build, ECR push, and deployment succeeded.'
    }

    failure {
      echo 'Pipeline failed. Review the Console Output. Manual rollback may be required.'
    }

    always {
      echo 'Pipeline finished.'
    }
  }
}
