# Robust Single-stage build for Laravel
FROM php:8.4-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    sqlite-dev \
    postgresql-dev \
    supervisor \
    nodejs \
    npm \
    icu-dev

# Install PHP extensions
RUN docker-php-ext-install pdo_pgsql pdo_sqlite pdo_mysql gd zip pcntl bcmath intl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy the entire mono-repo
COPY . .

# Build the backend specifically
WORKDIR /app/backend
RUN composer install --no-dev --optimize-autoloader
RUN npm install
RUN npm run build

# Build and zip the Chrome Extension
WORKDIR /app
RUN npm install
RUN npm run build
RUN mkdir -p /app/backend/public/downloads
RUN cd /app/dist && zip -r /app/backend/public/downloads/username-sticky-notes.zip ./*

# Move built application to final location
WORKDIR /var/www/html
RUN cp -a /app/backend/. .

# Setup SQLite
RUN mkdir -p database && touch database/database.sqlite && chmod 777 database/database.sqlite

# Configure Nginx & Supervisor
COPY backend/docker/nginx.conf /etc/nginx/http.d/default.conf
COPY backend/docker/supervisord.conf /etc/supervisord.conf

# Setup Entrypoint
COPY backend/docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache database

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
