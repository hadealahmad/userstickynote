# Single-stage build for Laravel (Backend only)
FROM php:8.3-fpm-alpine

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
    npm

# Install PHP extensions
RUN docker-php-ext-install pdo_sqlite gd zip pcntl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy backend files from the 'backend' folder in the repo to the root of the container
COPY backend/ .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install JS dependencies and build (using npm for simplicity in this stage)
RUN npm install
RUN npm run build

# Setup SQLite database placeholder
RUN mkdir -p database && touch database/database.sqlite && chmod 777 database/database.sqlite

# Configure Nginx (Path is relative to backend/ since we copied contents)
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Configure Supervisor
COPY docker/supervisord.conf /etc/supervisord.conf

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache database

EXPOSE 3000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
