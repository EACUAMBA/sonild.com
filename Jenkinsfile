pipeline {
    agent any

    stages {

        stage('Build') {
            steps {
                sh '''
                    docker compose build --pull
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker compose up -d --remove-orphans
                '''
            }
        }

        stage('Migrate') {
            steps {
                sh '''
                    docker compose exec -T app \
                    php artisan migrate --force
                '''
            }
        }

        stage('Optimize') {
            steps {
                sh '''
                    docker compose exec -T app \
                    php artisan optimize
                '''
            }
        }

        stage('SSR Check') {
            steps {
                sh '''
                    docker compose exec -T app \
                    php artisan inertia:check-ssr
                '''
            }
        }

        stage('Status') {
            steps {
                sh '''
                    docker compose ps
                '''
            }
        }
    }
}
