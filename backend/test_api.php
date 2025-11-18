<?php
// Simple test script to test API endpoints

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Create a test super admin user if not exists
$superAdmin = User::where('role', 'super')->first();

if (!$superAdmin) {
    $superAdmin = User::create([
        'full_name' => 'Test Super Admin',
        'email' => 'superadmin@test.com',
        'phone' => '+1234567890',
        'password_hash' => Hash::make('password123'),
        'role' => 'super',
        'status_active' => true,
        'email_verified_at' => now(),
    ]);
    echo "Created test super admin\n";
} else {
    echo "Found existing super admin: " . $superAdmin->email . "\n";
}

// Create a test token
$token = $superAdmin->createToken('test-token')->plainTextToken;
echo "Generated token: " . $token . "\n";

// Test the API endpoints
$baseUrl = 'http://localhost:8000/api';

function testEndpoint($url, $token, $method = 'GET') {
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => array(
            'Authorization: Bearer ' . $token,
            'Accept: application/json',
            'Content-Type: application/json'
        ),
    ));
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    
    echo "Testing: $url\n";
    echo "Status: $httpCode\n";
    echo "Response: " . substr($response, 0, 200) . "...\n\n";
    
    return json_decode($response, true);
}

// Test endpoints
testEndpoint($baseUrl . '/super-admin/landlords', $token);
testEndpoint($baseUrl . '/landlord/users', $token);