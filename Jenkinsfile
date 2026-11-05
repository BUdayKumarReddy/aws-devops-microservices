
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
        sh 'docker compose -f docker/docker-compose.yml --env-file docker/.env.example config -q'
      }
    }

    stage('Test') {
      steps {
        sh '''
          for service in user-service product-service order-service; do
            (cd services/$service && npm test)
          done
        '''
      }
    }

    stage('Build Images') {
      steps {
        sh '''
          docker build -t ${ECR_REGISTRY}/user-service:${IMAGE_TAG} services/user-service
          docker build -t ${ECR_REGISTRY}/product-service:${IMAGE_TAG} services/product-service
          docker build -t ${ECR_REGISTRY}/order-service:${IMAGE_TAG} services/order-service
        '''
      }
    }

    stage('Push to ECR') {
      steps {
        sh '''
          aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

          docker push ${ECR_REGISTRY}/user-service:${IMAGE_TAG}
          docker push ${ECR_REGISTRY}/product-service:${IMAGE_TAG}
          docker push ${ECR_REGISTRY}/order-service:${IMAGE_TAG}
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

            ssh -i "$SSH_KEY" \
              -o StrictHostKeyChecking=no \
              -o UserKnownHostsFile=/dev/null \
              "$SSH_USER@$APP_EC2_HOST" 'bash -s' <<REMOTE

set -Eeuo pipefail

cd /home/ubuntu/three-microservices/docker

BACKUP_FILE=".env.rollback"

if [ -f "$BACKUP_FILE" ]; then
  echo "A previous rollback backup exists. Refusing to overwrite it."
  exit 1
fi

echo "Saving current working image configuration..."
sudo cp .env "$BACKUP_FILE"
sudo chmod 600 "$BACKUP_FILE"

rollback() {
  echo "DEPLOYMENT FAILED. Starting automatic rollback..."

  if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Rollback backup not found!"
    return 1
  fi

  sudo cp "$BACKUP_FILE" .env

  echo "Restoring previous containers..."
  sudo docker compose config -q
  sudo docker compose up -d --remove-orphans

  sleep 5

  echo "Restarting Nginx..."
  sudo docker compose restart nginx

  echo "Verifying restored application..."
  curl --retry 10 --retry-delay 2 --retry-connrefused -fsS http://localhost/users/health
  echo
  curl --retry 10 --retry-delay 2 --retry-connrefused -fsS http://localhost/products/health
  echo
  curl --retry 10 --retry-delay 2 --retry-connrefused -fsS http://localhost/orders/health
  echo

  echo "Rollback completed. Previous version restored."
}

deploy_failed() {
  original_exit_code=$?

  trap - ERR

  if ! rollback; then
    echo "CRITICAL: Automatic rollback encountered an error."
  fi

  exit "$original_exit_code"
}

trap deploy_failed ERR

echo "Logging in to ECR..."
sudo aws ecr get-login-password --region ${AWS_REGION} | sudo docker login --username AWS --password-stdin ${ECR_REGISTRY}

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

echo "Restarting Nginx to refresh Docker service IPs..."
sudo docker compose restart nginx

echo "Checking application health..."
curl --retry 10 --retry-delay 2 --retry-connrefused -fsS http://localhost/users/health
echo
curl --retry 10 --retry-delay 2 --retry-connrefused -fsS http://localhost/products/health
echo
curl --retry 10 --retry-delay 2 --retry-connrefused -fsS http://localhost/orders/health
echo

echo "Deployment completed successfully!"

trap - ERR

echo "Removing rollback backup..."
sudo rm -f "$BACKUP_FILE"

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
      echo 'Pipeline failed. Review stage logs and rollback output.'
    }

    always {
      echo 'Pipeline finished.'
    }
  }
}
