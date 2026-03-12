# Multi-stage build (Mono-repo structure preservation)
FROM php:8.3-fpm-alpine as composer-builder
RUN apk add --no-cache unzip libzip-dev zip
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /app/backend
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader
COPY backend/app ./app
COPY backend/database ./database
RUN composer dump-autoload --no-dev --optimize

FROM oven/bun:latest as frontend-builder
WORKDIR /app
# Copy the entire mono-repo
COPY . .
# Layer in the vendor dependencies into the backend folder
COPY --from=composer-builder /app/backend/vendor ./backend/vendor
WORKDIR /app/backend
RUN bun install
RUN bun run build

FROM php:8.3-fpm-alpine
RUN apk add --no-cache nginx libpng-dev libzip-dev zip unzip sqlite-dev supervisor
RUN docker-php-ext-install pdo_sqlite gd zip pcntl
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
# Copy backend source
COPY backend/ .
# Copy vendor and assets
COPY --from=composer-builder /app/backend/vendor ./vendor
COPY --from=frontend-builder /app/backend/public/build ./public/build

RUN mkdir -p database && touch database/database.sqlite && chmod 777 database/database.sqlite
COPY backend/docker/nginx.conf /etc/nginx/http.d/default.conf
COPY backend/docker/supervisord.conf /etc/supervisord.conf
RUN chown -R www-data:www-data storage bootstrap/cache database

EXPOSE 3000
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
