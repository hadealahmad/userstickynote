# Multi-stage build for Laravel (Backend only)
# This Dockerfile is at the root but builds the 'backend' directory

# Stage 0: PHP Dependencies
FROM php:8.3-fpm-alpine as composer-builder
RUN apk add --no-cache unzip libzip-dev zip
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /app

# Copy composer files first for caching
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader

# Copy the rest of the backend to generate the autoloader
COPY backend/app ./app
COPY backend/database ./database
RUN composer dump-autoload --no-dev --optimize

# Stage 1: Build Laravel frontend assets
FROM oven/bun:latest as frontend-builder
WORKDIR /app

# Copy the source code first
COPY backend/ .

# IMPORTANT: Copy the vendor folder AFTER copying the source code
# to ensure we have the PHP dependencies needed by the JS build (like Ziggy)
COPY --from=composer-builder /app/vendor ./vendor

# Build assets
RUN bun install
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

# Copy everything from backend
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
