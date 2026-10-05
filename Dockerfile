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

WORKDIR /var/www/html

COPY . .

RUN composer install \
    --no-dev \
    --no-interaction \
    --optimize-autoloader

RUN npm ci
RUN npm run build

COPY docker/supervisor/supervisord.conf \
    /etc/supervisor/conf.d/supervisord.conf

RUN chown -R www-data:www-data \
    storage \
    bootstrap/cache

EXPOSE 8000

CMD ["/usr/bin/supervisord", "-n"]
