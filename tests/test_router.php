<?php

require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Core\Router;
use App\Core\Request;
use App\Core\Controller;

// Mock environment for Request
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/api/test-route';

echo "\n--- Testing Router & Routing ---\n";

// Mock Controller
class TestController extends Controller {
    public function index() {
        echo "✅ Controller Action Executed Successfully!\n";
    }
}

// Manually register namespace for test controller purely for this script execution
// In a real app, autoloader handles 'App\\Controllers' mapping to src/Controllers.
// Here we mock the class logic or alias it.
// Since Router instantiates "App\Controllers\{Name}", we need a trick or just test matching.

// Let's test by creating a mock Router that doesn't instantiate but verifies matching
// OR check if we can define the class in the namespace.

namespace App\Controllers;
class MockController {
    public function test() {
        echo "✅ MockController::test executed!\n";
    }
}

namespace Global;
use App\Core\Router;
use App\Core\Request;

$router = new Router();

// Define a route
echo "Defining route: GET /test-route -> MockController@test\n";
$router->get('/test-route', ['MockController', 'test']);

// Create Request
echo "Creating Request for: GET /test-route\n";
$request = new Request();

// Dispatch
echo "Dispatching...\n";
ob_start(); // Capture output
$router->dispatch($request);
$output = ob_get_clean();

if (str_contains($output, 'executed')) {
    echo $output;
    echo "✅ Router Dispatch Success\n";
} else {
    echo "❌ Router Dispatch Failed. Output: $output\n";
}

echo "--------------------------------\n\n";
