<?php

return [
    'name' => $_ENV['APP_NAME'] ?? 'SportsConnect',
    'env' => $_ENV['APP_ENV'] ?? 'production',
    'debug' => $_ENV['APP_DEBUG'] === 'true',
    'url' => $_ENV['APP_URL'] ?? 'http://localhost:8000',
    'key' => $_ENV['APP_KEY'] ?? '',
    
    'jwt' => [
        'secret' => $_ENV['JWT_SECRET'] ?? '',
        'expiry' => (int) ($_ENV['JWT_EXPIRY'] ?? 86400),
    ],
    
    'upload' => [
        'max_size' => (int) ($_ENV['UPLOAD_MAX_SIZE'] ?? 5242880),
        'allowed' => explode(',', $_ENV['ALLOWED_EXTENSIONS'] ?? 'jpg,jpeg,png,pdf'),
        'path' => dirname(__DIR__) . '/uploads',
    ],
];