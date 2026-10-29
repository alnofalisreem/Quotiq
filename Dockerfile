FROM node:22-bookworm-slim AS frontend

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY resources ./resources
COPY public ./public
COPY vite.config.js ./

RUN npm run build


FROM php:8.4-apache-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git unzip libpq-dev libonig-dev libzip-dev libicu-dev \
    && docker-php-ext-install -j2 \
        pdo_pgsql mbstring zip intl bcmath opcache \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --prefer-dist --no-interaction \
        --optimize-autoloader --no-scripts \
    && php artisan package:discover --ansi \
    && mkdir -p storage/framework/cache/data \
        storage/framework/sessions storage/framework/views \
    && chown -R www-data:www-data storage bootstrap/cache \
    && sed -i 's!/var/www/html!/var/www/html/public!g' \
        /etc/apache2/sites-available/000-default.conf

COPY --from=frontend /app/public/build ./public/build

EXPOSE 10000

CMD ["sh", "-c", "sed -i \"s/80/${PORT:-10000}/g\" /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf && php artisan config:cache && php artisan migrate --force && exec apache2-foreground"]
