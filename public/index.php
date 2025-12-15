<?php

declare(strict_types=1);

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', dirname(__DIR__) . '/logs/app.log');

// Autoload
require_once dirname(__DIR__) . '/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();

// Load configurations
$config = require dirname(__DIR__) . '/config/app.php';

// Initialize application
use App\Core\Router;
use App\Core\Request;
use App\Middleware\CorsMiddleware;

// Handle CORS
CorsMiddleware::handle();

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Create request
$request = new Request();

// Load routes
$router = new Router();
require dirname(__DIR__) . '/routes/api.php';

// Dispatch request
$router->dispatch($request);