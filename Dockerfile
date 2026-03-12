# Build for Laravel with PHP 8.4 (Matched to composer.lock requirements)
FROM php:8.4-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    sqlite-dev \
    supervisor \
    nodejs \
    npm \
    icu-dev

# Install PHP extensions
RUN docker-php-ext-install pdo_sqlite gd zip pcntl bcmath intl

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

# Move built application to final location
WORKDIR /var/www/html
RUN cp -a /app/backend/. .

# Setup SQLite
RUN mkdir -p database && touch database/database.sqlite && chmod 777 database/database.sqlite

# Configure Nginx & Supervisor
COPY backend/docker/nginx.conf /etc/nginx/http.d/default.conf
COPY backend/docker/supervisord.conf /etc/supervisord.conf

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache database

EXPOSE 3000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
