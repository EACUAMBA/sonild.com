#!/bin/sh
set -eu

mkdir -p /var/www/html/storage/app/public \
    /var/www/html/storage/app/private \
    /var/www/html/storage/framework/cache/data \
    /var/www/html/storage/framework/sessions \
    /var/www/html/storage/framework/views \
    /var/www/html/storage/logs \
    /var/www/html/bootstrap/cache

chown www-data:www-data /var/www/html/storage \
    /var/www/html/storage/app /var/www/html/storage/app/public \
    /var/www/html/storage/app/private /var/www/html/storage/framework \
    /var/www/html/storage/framework/cache /var/www/html/storage/framework/cache/data \
    /var/www/html/storage/framework/sessions /var/www/html/storage/framework/views \
    /var/www/html/storage/logs /var/www/html/bootstrap/cache

exec docker-php-entrypoint "$@"
