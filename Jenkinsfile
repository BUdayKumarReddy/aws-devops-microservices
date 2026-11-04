pipeline {
  agent any
  options { timestamps(); disableConcurrentBuilds() }

  environment {
    AWS_REGION = 'ap-south-2'
    AWS_ACCOUNT_ID = '576406717252'
    IMAGE_TAG = "build-${BUILD_NUMBER}"
    ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Validate Compose') {
      steps { sh 'docker compose -f docker/docker-compose.yml --env-file docker/.env.example config -q' }
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
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-ecr-push']]) {
          sh '''
            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
            docker push ${ECR_REGISTRY}/user-service:${IMAGE_TAG}
            docker push ${ECR_REGISTRY}/product-service:${IMAGE_TAG}
            docker push ${ECR_REGISTRY}/order-service:${IMAGE_TAG}
          '''
        }
      }
    }
    stage('Deploy') {
      steps {
        echo 'TODO: Securely transfer compose/env deployment files and invoke deploy.sh on EC2.'
      }
    }
  }
  post {
    success { echo 'Build and image publishing succeeded.' }
    failure { echo 'Pipeline failed. Review stage logs.' }
    always { echo 'Pipeline finished.' }
  }
}
