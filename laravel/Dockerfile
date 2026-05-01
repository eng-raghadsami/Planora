FROM php:8.2-cli

# تثبيت extensions
RUN apt-get update && apt-get install -y \
    git unzip curl libzip-dev zip \
    && docker-php-ext-install pdo pdo_mysql zip

# تثبيت composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# نسخ المشروع
COPY . .

# تثبيت dependencies
RUN composer install

# تشغيل السيرفر
CMD php artisan serve --host=0.0.0.0 --port=10000