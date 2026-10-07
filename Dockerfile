FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    nodejs \
    npm \
    supervisor \
    libzip-dev \
    libpq-dev \
    libicu-dev \
    libonig-dev \
    && docker-php-ext-install \
        pdo \
        pdo_mysql \
        mbstring \
        intl \
        zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY docker/php/uploads.ini /usr/local/etc/php/conf.d/uploads.ini

WORKDIR /var/www/html

COPY . .

RUN composer install \
    --no-dev \
    --no-interaction \
    --optimize-autoloader

RUN npm ci
RUN npm run build:ssr

COPY docker/supervisor/supervisord.conf \
    /etc/supervisor/conf.d/supervisord.conf

RUN chown -R www-data:www-data \
    storage \
    bootstrap/cache

ENTRYPOINT ["sh", "/var/www/html/docker/php/entrypoint.sh"]

EXPOSE 8000

CMD ["/usr/bin/supervisord", "-n"]
