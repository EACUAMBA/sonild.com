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
                    for attempt in 1 2 3 4 5 6; do
                        if docker compose exec -T app php artisan inertia:check-ssr; then
                            exit 0
                        fi
                        sleep 5
                    done
                    docker compose logs --tail=100 app
                    exit 1
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
