# Multi-stage build for Laravel (Backend only)
# This Dockerfile is at the root but builds the 'backend' directory

# Stage 0: PHP Dependencies (needed because frontend build imports from vendor/tightenco/ziggy)
FROM php:8.3-fpm-alpine as composer-builder
RUN apk add --no-cache unzip libzip-dev zip
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader
COPY backend/app ./app
COPY backend/database ./database
RUN composer dump-autoload --no-dev --optimize

# Stage 1: Build Laravel frontend assets
FROM oven/bun:latest as frontend-builder
WORKDIR /app
# Copy vendor from composer stage so Ziggy imports work
COPY --from=composer-builder /app/vendor ./vendor
# Copy backend files specifically
COPY backend/package.json backend/bun.lock ./
RUN bun install
COPY backend/ .
RUN bun run build

# Stage 2: Final PHP Application
FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    sqlite-dev \
    supervisor

# Install PHP extensions
RUN docker-php-ext-install pdo_sqlite gd zip pcntl

WORKDIR /var/www/html

# Copy backend files
COPY backend/ .
# Copy vendor and built assets from previous stages
COPY --from=composer-builder /app/vendor ./vendor
COPY --from=frontend-builder /app/public/build ./public/build

# Setup SQLite database placeholder
RUN mkdir -p database && touch database/database.sqlite && chmod 777 database/database.sqlite

# Configure Nginx
COPY backend/docker/nginx.conf /etc/nginx/http.d/default.conf

# Configure Supervisor
COPY backend/docker/supervisord.conf /etc/supervisord.conf

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache database

EXPOSE 3000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
