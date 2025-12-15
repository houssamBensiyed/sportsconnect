<?php

require_once dirname(__DIR__) . '/vendor/autoload.php';

use Dotenv\Dotenv;
use App\Models\User;
use App\Models\Sport;
use App\Models\Coach;
use App\Models\Sportif;
use App\Core\Database;

// Load env
$dotenv = Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();

echo "\n--- Testing Models ---\n";

$db = Database::getInstance();
$conn = $db->getConnection();

// --- 1. Test User Model ---
echo "\n[User Model]\n";
$userModel = new User();
$testEmail = 'test_model_' . time() . '@example.com';
$password = 'Secret123!';

// Create
echo "Creating User ($testEmail)... ";
$userId = $userModel->create([
    'email' => $testEmail,
    'password' => $password,
    'role' => 'coach'
]);

if ($userId) {
    echo "✅ Created (ID: $userId)\n";
} else {
    echo "❌ Failed to create user\n";
    exit;
}

// Find
echo "Finding User by ID... ";
$user = $userModel->findById($userId);
if ($user && $user['email'] === $testEmail) {
    echo "✅ Found\n";
} else {
    echo "❌ Not Found or Email mismatch\n";
}

// Verify Password
echo "Verifying Password... ";
// fetch fresh to get hash
$freshUser = $db->fetch("SELECT * FROM users WHERE id = ?", [$userId]);
if ($userModel->verifyPassword($password, $freshUser['password'])) {
    echo "✅ Valid\n";
} else {
    echo "❌ Invalid\n";
}

// --- 2. Test Sport Model ---
echo "\n[Sport Model]\n";
$sportModel = new Sport();
$sportName = 'Test Sport ' . time();

echo "Creating Sport ($sportName)... ";
$sportId = $sportModel->create([
    'name' => $sportName,
    'category' => 'sports_collectifs'
]);

if ($sportId) {
    echo "✅ Created (ID: $sportId)\n";
} else {
    echo "❌ Failed to create sport\n";
}

// --- 3. Test Coach Model ---
echo "\n[Coach Model]\n";
$coachModel = new Coach();

echo "Creating Coach Profile... ";
$coachId = $coachModel->create([
    'user_id' => $userId,
    'first_name' => 'John',
    'last_name' => 'Doe',
    'city' => 'Paris',
    'hourly_rate' => 50
]);

if ($coachId) {
    echo "✅ Created (ID: $coachId)\n";
} else {
    echo "❌ Failed to create coach profile\n";
}

// Add Sport to Coach
if ($coachId && $sportId) {
    echo "Adding Sport to Coach... ";
    if ($coachModel->addSport($coachId, $sportId, 'expert')) {
        echo "✅ Added\n";
    } else {
        echo "❌ Failed\n";
    }
}

// --- Cleanup (Optional, but good for reliable tests) ---
// We usually leave data or wrap in transaction and rollback. 
// For this simple verify script, we'll delete the user which should cascade if FKs are set up correctly, 
// OR we delete manually to be safe.

echo "\n[Cleanup]\n";
if ($sportId) {
    $sportModel->delete($sportId);
    echo "Deleted Sport.\n";
}
if ($userId) {
    // Coach should be deleted via cascade or we delete it first? 
    // Assuming DB schema has ON DELETE CASCADE for foreign keys on users.id
    // If not, we might error. Let's try deleting user.
    try {
        $userModel->delete($userId);
        echo "Deleted User (and hopefully related Coach data via FK cascade).\n";
    } catch (Exception $e) {
        echo "Cleanup Warning: " . $e->getMessage() . "\n";
    }
}

echo "\n----------------------\n";
