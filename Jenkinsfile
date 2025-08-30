pipeline {
    agent any

    environment {
        DOCKER_HUB_REPO = "sidgautam0104/coding_assignment_kb"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Lint') {
            steps {
                sh 'cd backend && npm install && npm run lint || true'
                sh 'cd scheduler_frontend && npm install && npm run lint || true'
            }
        }

        stage('Unit Tests') {
            steps {
                sh 'cd backend && npm test || true'
                sh 'cd scheduler_frontend && npm test || true'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                    sh '''
                      cd backend
                      npx sonar-scanner \
                        -Dsonar.projectKey=backend \
                        -Dsonar.sources=src \
                        -Dsonar.host.url=http://localhost:9000 \
                        -Dsonar.login=$SONAR_TOKEN
                      
                      cd ../scheduler_frontend
                      npx sonar-scanner \
                        -Dsonar.projectKey=frontend \
                        -Dsonar.sources=src \
                        -Dsonar.host.url=http://localhost:9000 \
                        -Dsonar.login=$SONAR_TOKEN
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                  docker build -t $DOCKER_HUB_REPO:backend-$BUILD_NUMBER ./backend
                  docker build -t $DOCKER_HUB_REPO:frontend-$BUILD_NUMBER ./scheduler_frontend
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                      echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                      docker push $DOCKER_HUB_REPO:backend-$BUILD_NUMBER
                      docker push $DOCKER_HUB_REPO:frontend-$BUILD_NUMBER
                    '''
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                sh '''
                  docker-compose down || true
                  docker-compose up -d --build
                '''
            }
        }
    }

    post {
        always {
            echo "Pipeline finished (status: ${currentBuild.currentResult})"
        }
    }
}