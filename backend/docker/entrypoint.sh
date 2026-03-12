#!/bin/sh

# Run migrations
php artisan migrate --force

# Seed if necessary (optional)
# php artisan db:seed --force

# Start Supervisor
exec /usr/bin/supervisord -c /etc/supervisord.conf
