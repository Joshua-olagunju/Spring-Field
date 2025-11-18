<?php
// Simple test script to verify security registration works

$url = 'http://localhost:8000/api/register';

$data = [
    'first_name' => 'Test',
    'last_name' => 'Security',
    'email' => 'testsecurity@example.com',
    'phone_number' => '1234567890',
    'password' => 'TestPassword123!',
    'password_confirmation' => 'TestPassword123!',
    'otp_code' => '779068'
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/x-www-form-urlencoded',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status Code: " . $httpCode . "\n";
echo "Response: " . $response . "\n";

if ($httpCode === 200 || $httpCode === 201) {
    echo "✅ SUCCESS: Security registration working!\n";
} else {
    echo "❌ FAILED: Security registration still has issues\n";
}
?>