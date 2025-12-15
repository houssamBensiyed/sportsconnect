<?php

// tests/test_single_request.php
// Usage: php tests/test_single_request.php METHOD URI [JSON_BODY] [TOKEN]

require_once __DIR__ . '/../vendor/autoload.php';

use App\Core\Router;
use App\Core\Request;
use Dotenv\Dotenv;

// Load Env
$dotenv = Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();

// Parse Args
$method = $argv[1] ?? 'GET';
$uri = $argv[2] ?? '/health';
$bodyJson = $argv[3] ?? '{}';
$token = $argv[4] ?? null;

// Mock SERVER and Request
$_SERVER['REQUEST_METHOD'] = $method;
$_SERVER['REQUEST_URI'] = '/api' . $uri; // App expects /api prefix usually stripped by Request, but Request logic strips it.
// Actually Request.php:
// $uri = $_SERVER['REQUEST_URI'] ?? '/';
// $uri = preg_replace('#^/api#', '', $uri);

// So if I pass just "/health", I should set REQUEST_URI to "/api/health" OR just ensure I set it such that stripped result is correct.
// Let's set it to '/api' . $uri to match real world.

if ($token && $token !== 'null') {
    $_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
}

// Mock Body
if ($method === 'POST' || $method === 'PUT') {
    // We need to inject this into Request. 
    // Request reads php://input. We can't write to that easily.
    // However, Request.php has:
    // if (str_contains($contentType, 'application/json')) ...
    // But we can ALSO mock $_POST if not json?
    // Let's modify Request slightly? No.
    // Better: We can use a property in Request if we could instantiate it with data.
    // BUT Request constructor reads globals.
    // Workaround: Use stream wrapper or similar? Too complex.
    
    // EASIEST: Just modify Request.php to allow injection or check a global variable for testing?
    // OR: Re-implement Request partial logic in this test to "Force" the body into private property via reflection?
    
    // Let's rely on `php://input` mocking is hard.
    // Let's simply populate $_POST if it's not JSON? The app seems to rely on JSON often. 
    // Let's check Request.php again in my mind.
    // It reads `file_get_contents('php://input')` if Content-Type is json.
    
    // I can redefine `file_get_contents` if I use namespace tricks, but `App\Core` namespace is used.
    
    // ALTERNATIVE: Use a temporary file for input?
    // No.
    
    // BEST FOR TEST: Use Reflection to set the private $body property of the Request object after instantiation!
}

$_SERVER['HTTP_CONTENT_TYPE'] = 'application/json';

// Instantiate
$request = new Request();

// Inject Body via Reflection
if ($bodyJson) {
    $reflection = new ReflectionClass($request);
    $property = $reflection->getProperty('body');
    $property->setAccessible(true);
    $property->setValue($request, json_decode($bodyJson, true) ?? []);
}

// Router
$router = new Router();
require dirname(__DIR__) . '/routes/api.php';

// Dispatch
ob_start();
$router->dispatch($request);
// If dispatch exits, output is captured. But if it returns (error?), we capture that too.
// Note: Response class exits.
echo ob_get_clean();
