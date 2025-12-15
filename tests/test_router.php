<?php

namespace App\Controllers;

require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Core\Router;
use App\Core\Request;
use App\Core\Controller;

// Mock environment for Request
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/api/test-route';

class MockController {
    public function test() {
        echo "✅ MockController::test executed!\n";
    }
}

echo "\n--- Testing Router & Routing ---\n";

$router = new Router();

// Define a route
// Since Router appends "App\Controllers\", passing 'MockController' will resolve to 'App\Controllers\MockController'
echo "Defining route: GET /test-route -> MockController@test\n";
$router->get('/test-route', ['MockController', 'test']);

// Create Request
echo "Creating Request for: GET /test-route\n";
$request = new Request();

// Dispatch
echo "Dispatching...\n";
ob_start();
$router->dispatch($request);
$output = ob_get_clean();

if (str_contains($output, 'executed')) {
    echo $output;
    echo "✅ Router Dispatch Success\n";
} else {
    echo "❌ Router Dispatch Failed. Output: $output\n";
}

echo "--------------------------------\n\n";
