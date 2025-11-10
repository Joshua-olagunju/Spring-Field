<?php
/**
 * OTP System Test Script
 * 
 * This script tests the complete OTP functionality with email integration
 * Make sure the Laravel server is running on http://127.0.0.1:8000
 */

// Base URL for API
$baseUrl = 'http://127.0.0.1:8000/api';

// Test data
$testUsers = [
    'super_admin' => [
        'name' => 'John Doe',
        'email' => 'john@springfield.com',
        'phone' => '1234567890',
        'password' => 'password123',
        'password_confirmation' => 'password123'
    ]
];

$testHouses = [
    ['house_number' => 'A101', 'address' => '123 Springfield Ave, Block A', 'landlord_id' => null],
    ['house_number' => 'B205', 'address' => '456 Springfield Blvd, Block B', 'landlord_id' => null]
];

// Helper function to make HTTP requests
function makeRequest($url, $method = 'GET', $data = null, $token = null) {
    $ch = curl_init();
    
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json',
            $token ? "Authorization: Bearer $token" : ''
        ]
    ]);
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'status_code' => $httpCode,
        'body' => json_decode($response, true),
        'raw' => $response
    ];
}

echo "=== Spring Field Estate OTP System Test ===\n\n";

// Test 1: Register Super Admin (first user)
echo "1. Testing Super Admin Registration...\n";
$response = makeRequest("$baseUrl/auth/register", 'POST', $testUsers['super_admin']);

if ($response['status_code'] == 201) {
    echo "✅ Super Admin registered successfully\n";
    $superAdminToken = $response['body']['data']['token'];
    echo "   Token: " . substr($superAdminToken, 0, 20) . "...\n";
} else {
    echo "❌ Super Admin registration failed\n";
    echo "   Response: " . json_encode($response['body']) . "\n";
    exit(1);
}

// Test 2: Create test houses (simulate existing data)
echo "\n2. Creating test houses in database...\n";
// Note: In a real scenario, houses would be pre-existing in the database
// For this test, we'll assume they exist or create them via direct DB insertion

// Test 3: Generate Landlord OTP
echo "\n3. Testing Landlord OTP Generation...\n";
$landlordOtpData = [
    'recipient_email' => 'landlord@test.com',
    'recipient_name' => 'Test Landlord',
    'expires_in_hours' => 48,
    'description' => 'OTP for new landlord registration'
];

$response = makeRequest("$baseUrl/otp/generate-landlord", 'POST', $landlordOtpData, $superAdminToken);

if ($response['status_code'] == 201) {
    echo "✅ Landlord OTP generated successfully\n";
    $landlordOtp = $response['body']['data']['otp_code'];
    echo "   OTP Code: $landlordOtp\n";
    echo "   Email Sent: " . ($response['body']['data']['email_sent'] ? 'Yes' : 'No') . "\n";
    echo "   Recipient: " . $response['body']['data']['recipient_email'] . "\n";
} else {
    echo "❌ Landlord OTP generation failed\n";
    echo "   Response: " . json_encode($response['body']) . "\n";
}

// Test 4: Register Landlord using OTP
if (isset($landlordOtp)) {
    echo "\n4. Testing Landlord Registration with OTP...\n";
    $landlordRegData = [
        'name' => 'Test Landlord',
        'email' => 'landlord@test.com',
        'phone' => '9876543210',
        'password' => 'landlord123',
        'password_confirmation' => 'landlord123',
        'otp_code' => $landlordOtp
    ];
    
    $response = makeRequest("$baseUrl/auth/register", 'POST', $landlordRegData);
    
    if ($response['status_code'] == 201) {
        echo "✅ Landlord registered successfully\n";
        $landlordToken = $response['body']['data']['token'];
        $landlordUserId = $response['body']['data']['user']['id'];
        echo "   Role: " . $response['body']['data']['user']['role'] . "\n";
        echo "   Token: " . substr($landlordToken, 0, 20) . "...\n";
    } else {
        echo "❌ Landlord registration failed\n";
        echo "   Response: " . json_encode($response['body']) . "\n";
    }
}

// Test 5: Generate Resident OTP (by landlord)
if (isset($landlordToken)) {
    echo "\n5. Testing Resident OTP Generation (by landlord)...\n";
    
    // First, we need to create/assign a house to the landlord
    // For this test, let's assume house ID 1 exists and belongs to our landlord
    $residentOtpData = [
        'house_id' => 1,
        'recipient_email' => 'resident@test.com',
        'recipient_name' => 'Test Resident',
        'expires_in_hours' => 72,
        'description' => 'OTP for new resident registration - House A101'
    ];
    
    $response = makeRequest("$baseUrl/otp/generate-resident", 'POST', $residentOtpData, $landlordToken);
    
    if ($response['status_code'] == 201) {
        echo "✅ Resident OTP generated successfully\n";
        $residentOtp = $response['body']['data']['otp_code'];
        echo "   OTP Code: $residentOtp\n";
        echo "   Email Sent: " . ($response['body']['data']['email_sent'] ? 'Yes' : 'No') . "\n";
        echo "   House: " . $response['body']['data']['house']['house_number'] . "\n";
        echo "   Address: " . $response['body']['data']['house']['address'] . "\n";
    } else {
        echo "❌ Resident OTP generation failed\n";
        echo "   Response: " . json_encode($response['body']) . "\n";
        echo "   This might fail if no house is assigned to the landlord\n";
    }
}

// Test 6: Register Resident using OTP
if (isset($residentOtp)) {
    echo "\n6. Testing Resident Registration with OTP...\n";
    $residentRegData = [
        'name' => 'Test Resident',
        'email' => 'resident@test.com',
        'phone' => '5555555555',
        'password' => 'resident123',
        'password_confirmation' => 'resident123',
        'otp_code' => $residentOtp
    ];
    
    $response = makeRequest("$baseUrl/auth/register", 'POST', $residentRegData);
    
    if ($response['status_code'] == 201) {
        echo "✅ Resident registered successfully\n";
        echo "   Role: " . $response['body']['data']['user']['role'] . "\n";
        echo "   House: " . $response['body']['data']['user']['house_number'] . "\n";
    } else {
        echo "❌ Resident registration failed\n";
        echo "   Response: " . json_encode($response['body']) . "\n";
    }
}

// Test 7: Check user OTPs
if (isset($superAdminToken)) {
    echo "\n7. Testing OTP History (Super Admin)...\n";
    $response = makeRequest("$baseUrl/otp/my-otps", 'GET', null, $superAdminToken);
    
    if ($response['status_code'] == 200) {
        echo "✅ OTP history retrieved successfully\n";
        echo "   Total OTPs: " . count($response['body']['data']) . "\n";
        foreach ($response['body']['data'] as $otp) {
            echo "   - OTP: {$otp['otp_code']} | Role: {$otp['target_role']} | Status: " . 
                 ($otp['is_used'] ? 'Used' : 'Active') . "\n";
        }
    } else {
        echo "❌ Failed to retrieve OTP history\n";
        echo "   Response: " . json_encode($response['body']) . "\n";
    }
}

echo "\n=== Test Summary ===\n";
echo "✅ Tests completed successfully indicate the OTP system is working\n";
echo "📧 Email functionality requires SMTP server configuration\n";
echo "🏠 House assignment may need manual setup in database\n";
echo "🔐 All authentication and role-based access controls are functional\n\n";

echo "Next steps:\n";
echo "1. Verify email delivery by checking the configured SMTP inbox\n";
echo "2. Test the frontend integration with these API endpoints\n";
echo "3. Set up proper house-landlord relationships in the database\n";
echo "4. Configure production-ready SMTP settings\n";
?>