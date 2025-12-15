<?php

require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Helpers\Validator;
use App\Helpers\Sanitizer;

echo "\n--- Testing Helper Classes ---\n";

// 1. Sanitize
echo "[Sanitizer]\n";
$dirtyHtml = "<script>alert('xss')</script> Hello";
$cleanHtml = Sanitizer::clean($dirtyHtml);
echo "Input: $dirtyHtml\n";
echo "Output: $cleanHtml\n";

if ($cleanHtml === "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt; Hello") {
    echo "✅ HTML Sanitization Passed\n";
} else {
    echo "❌ HTML Sanitization Failed\n";
}

// 2. Validator
echo "\n[Validator]\n";
$data = [
    'username' => 'user123',
    'email' => 'invalid-email',
    'age' => 10
];
$rules = [
    'username' => 'required',
    'email' => 'required|email',
    'age' => 'min:18'
];

echo "Validating data: " . json_encode($data) . "\n";
echo "Rules: " . json_encode($rules) . "\n";

$validator = new Validator($data, $rules);

if (!$validator->validate()) {
    echo "✅ Validation correctly failed.\n";
    print_r($validator->getErrors());
} else {
    echo "❌ Validation passed (Should have failed)\n";
}

echo "------------------------------\n\n";
