<?php

require_once dirname(__DIR__) . '/vendor/autoload.php';

use Dotenv\Dotenv;
use App\Core\Database;

// Load env
$dotenv = Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();

echo "\n--- Testing Database Connection ---\n";

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    echo "✅ Connection Successful!\n";
    echo "Client Version: " . $conn->getAttribute(PDO::ATTR_CLIENT_VERSION) . "\n";
    echo "Server Version: " . $conn->getAttribute(PDO::ATTR_SERVER_VERSION) . "\n";
    
    // Test Query
    $stmt = $db->query("SELECT 1 as val");
    $res = $stmt->fetch();
    
    if ($res['val'] == 1) {
        echo "✅ Query Test Successful\n";
    } else {
        echo "❌ Query Test Failed\n";
    }

} catch (Exception $e) {
    echo "❌ Connection Failed: " . $e->getMessage() . "\n";
    echo "Tip: Ensure DB_HOST and DB_PORT in .env match your execution environment.\n";
}

echo "-----------------------------------\n\n";
