#!/bin/sh
set -e

cp -a /var/www/html/public/. /shared-public/

exec php-fpm
