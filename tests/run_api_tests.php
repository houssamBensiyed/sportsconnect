<?php

// tests/run_api_tests.php

$apiUrl = 'http://localhost:8000/api'; // Not used, we use internal simulation
$scriptPath = __DIR__ . '/test_single_request.php';

function runRequest($label, $method, $uri, $data = [], $token = null) {
    global $scriptPath;
    echo "Testing [$method $uri] - $label... ";
    
    $json = json_encode($data);
    
    // Escape arguments for shell (basic)
    $cmd = sprintf('php "%s" "%s" "%s" %s %s', 
        $scriptPath, 
        $method, 
        $uri, 
        escapeshellarg($json), 
        $token ? escapeshellarg($token) : 'null'
    );
    
    $output = shell_exec($cmd);
    $response = json_decode($output, true);
    
    if ($response && ($response['success'] ?? false) === true) {
        echo "✅ OK\n";
        return $response;
    } else {
        echo "❌ FAILED\n";
        echo "Response: " . substr($output, 0, 500) . "\n";
        return $response;
    }
}

// 0. Init Database (Optional, relying on existing or clean yourself)
// Ideally verify health first
runRequest('Health Check', 'GET', '/health');

// 1. Register Coach
$coachEmail = 'coach_test_' . time() . '@test.com';
$coachPass = 'Pass123!';
$coachRes = runRequest('Register Coach', 'POST', '/auth/register', [
    'email' => $coachEmail,
    'password' => $coachPass,
    'role' => 'coach',
    'first_name' => 'Coach',
    'last_name' => 'Test',
    'phone' => '0611111111'
]);
$coachToken = $coachRes['data']['token'] ?? null;
$coachId = $coachRes['data']['user']['profile_id'] ?? null;

// 2. Register Sportif
$sportifEmail = 'sportif_test_' . time() . '@test.com';
$sportifRes = runRequest('Register Sportif', 'POST', '/auth/register', [
    'email' => $sportifEmail,
    'password' => $coachPass,
    'role' => 'sportif',
    'first_name' => 'Sportif',
    'last_name' => 'Test',
    'phone' => '0622222222'
]);
$sportifToken = $sportifRes['data']['token'] ?? null;
$sportifId = $sportifRes['data']['user']['profile_id'] ?? null;

if (!$coachToken || !$sportifToken) {
    echo "❌ Cannot proceed without tokens.\n";
    exit(1);
}

// 3. Login Coach (Verify Login)
$loginRes = runRequest('Login Coach', 'POST', '/auth/login', [
    'email' => $coachEmail,
    'password' => $coachPass
]);

// 4. Update Coach Profile
runRequest('Update Coach Profile', 'PUT', '/coaches/profile', [
    'city' => 'Paris',
    'hourly_rate' => 50,
    'bio' => 'Best coach ever',
    'is_available' => true
], $coachToken);

// 5. Create Availability (Coach)
$availRes = runRequest('Create Availability', 'POST', '/availabilities', [
    'date' => date('Y-m-d', strtotime('+1 day')),
    'start_time' => '10:00',
    'end_time' => '11:00'
], $coachToken);
$availId = $availRes['data']['id'] ?? null;

// 6. Search Coach (Public)
runRequest('Search Coaches', 'GET', '/coaches?city=Paris');

// 7. Get Coach Profile (Public)
runRequest('Get Coach Profile', 'GET', '/coaches/' . $coachId); // ID might need mapping to Profile ID? 
// CoachController::show uses ID. Check if it expects UserID or ProfileID.
// Usually REST resource ID is the Profile ID.
// The register response returned user.profile_id or similar?
// AuthController register response: user -> id (User ID).
// CoachController show($id) -> $this->coachModel->getProfile($id).
// CoachModel getProfile expects ID (likely Coach ID, which is distinct from User ID).
// Let's assume Coach ID was created.
// We need the Coach ID.
// Auth Register response data structure:
// "data": { "user": { "id": 1 ... }, "token": "..." }
// Does it return Coach ID?
// Let's look at AuthController::register again (via memory or hope).
// If not, we can find it via GET /auth/me or GET /coaches?email=...
$meRes = runRequest('Get Me (Coach)', 'GET', '/auth/me', [], $coachToken);
$realCoachId = $meRes['data']['profile']['id'] ?? null;

if ($realCoachId) {
    runRequest('Get Coach Profile (ID)', 'GET', '/coaches/' . $realCoachId);
    
    // 8. Create Reservation (Sportif)
    if ($availId) {
        // Need Sport ID. Assume 1 exists (Football) from DB Dump.
        $resRes = runRequest('Create Reservation', 'POST', '/reservations', [
            'coach_id' => $realCoachId,
            'availability_id' => $availId,
            'sport_id' => 1,
            'notes' => 'Lets go'
        ], $sportifToken);
        $reservationId = $resRes['data']['id'] ?? null;

        if ($reservationId) {
            // 9. Coach Accepts
            runRequest('Accept Reservation', 'PUT', '/reservations/' . $reservationId . '/accept', [], $coachToken);
            
            // 10. Check Notifications (Sportif)
            runRequest('Check Notifications', 'GET', '/notifications', [], $sportifToken);
            
            // 11. PDF
            // runRequest('Get Reservation PDF', 'GET', '/pdf/reservation/' . $reservationId, [], $sportifToken);
        }
    }
}

echo "\nTests Completed.\n";
