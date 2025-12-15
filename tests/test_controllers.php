<?php

// tests/test_controllers.php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Controllers\AuthController;
use App\Models\User;
use App\Core\Request;
use Dotenv\Dotenv;

// Init Env
$dotenv = Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();

echo "\n--- Testing Controllers ---\n";

function makeRequest($method, $uri, $body = [], $query = []) {
    $_SERVER['REQUEST_METHOD'] = $method;
    $_SERVER['REQUEST_URI'] = '/api' . $uri;
    $_POST = $body; // Simple mock for body
    $_GET = $query;
    // Clear previous parsing
    // Request constructor reads globals immediately.
    return new Request();
}

$userModel = new User();
$testEmail = 'ctrl_test_' . time() . '@example.com';
$testPass = 'Pass123!';

// --- 1. Test AuthController::register ---
echo "\n[AuthController::register] register $testEmail\n";
$authCtrl = new AuthController();
$req = makeRequest('POST', '/auth/register', [
    'email' => $testEmail,
    'password' => $testPass,
    'role' => 'coach',
    'first_name' => 'Controller',
    'last_name' => 'Test',
    'phone' => '0123456789'
]);

// Capture output
ob_start();
try {
    $authCtrl->register($req);
} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage();
}
$output = ob_get_clean();
$resp = json_decode($output, true);

if (isset($resp['status']) && $resp['status'] === 201) {
    echo "✅ Success (User ID: " . $resp['data']['user']['id'] . ")\n";
    $token = $resp['data']['token'];
    $userId = $resp['data']['user']['id'];
} else {
    echo "❌ Failed\n";
    print_r($resp);
    exit;
}

// --- 2. Test AuthController::login ---
echo "\n[AuthController::login]\n";
$req = makeRequest('POST', '/auth/login', [
    'email' => $testEmail,
    'password' => $testPass
]);

ob_start();
$authCtrl->login($req);
$output = ob_get_clean();
$resp = json_decode($output, true);

if (isset($resp['status']) && $resp['status'] === 200 && !empty($resp['data']['token'])) {
    echo "✅ Success (Token received)\n";
} else {
    echo "❌ Failed\n";
    print_r($resp);
}

// --- 3. Test AuthController::me (Protected) ---
echo "\n[AuthController::me] (Protected)\n";
// Mock Auth Middleware by setting global user
// In real app, middleware parses token and sets this.
$GLOBALS['auth_user'] = [
    'id' => $userId,
    'email' => $testEmail,
    'role' => 'coach'
];

$req = makeRequest('GET', '/auth/me');
// Mock Authorization header if Request class supported setting it via constructor easier, 
// but Controller::me uses $GLOBALS['auth_user'] directly as per implementation.

ob_start();
$authCtrl->me($req);
$output = ob_get_clean();
$resp = json_decode($output, true);

if (isset($resp['status']) && $resp['status'] === 200 && $resp['data']['id'] == $userId) {
    echo "✅ Success\n";
} else {
    echo "❌ Failed\n";
    print_r($resp);
}

// --- Cleanup ---
echo "\n[Cleanup]\n";
if (isset($userId)) {
    $userModel->delete($userId);
    echo "Deleted User $userId.\n";
}

echo "----------------------\n";
