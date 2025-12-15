<?php

namespace App\Middleware;

class CorsMiddleware
{
    public static function handle(): void
    {
        $config = require dirname(__DIR__, 2) . '/config/cors.php';
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if (in_array($origin, $config['allowed_origins'])) {
            header("Access-Control-Allow-Origin: {$origin}");
        }

        header('Access-Control-Allow-Methods: ' . implode(', ', $config['allowed_methods']));
        header('Access-Control-Allow-Headers: ' . implode(', ', $config['allowed_headers']));
        header('Access-Control-Max-Age: ' . $config['max_age']);

        if ($config['credentials']) {
            header('Access-Control-Allow-Credentials: true');
        }
    }
}