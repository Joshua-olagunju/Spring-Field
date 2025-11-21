<?php

/**
 * Test API endpoints directly to verify they work correctly
 */

echo "=== PAYMENT API ENDPOINT TEST ===\n\n";

// Test user credentials
$email = 'yungtee5333@gmail.com';
$password = 'Jackson5$';

$baseUrl = 'http://localhost:8000/api';

echo "Step 1: Login to get auth token...\n";

$loginData = [
    'email' => $email,
    'password' => $password
];

$ch = curl_init("$baseUrl/login");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    die("Login failed! HTTP Code: $httpCode\nResponse: $response\n");
}

$loginResult = json_decode($response, true);
if (!isset($loginResult['token'])) {
    die("Login failed! No token in response.\nResponse: $response\n");
}

$authToken = $loginResult['token'];
$userId = $loginResult['user']['id'];

echo "✅ Login successful! User ID: $userId\n";
echo "Auth Token: " . substr($authToken, 0, 20) . "...\n\n";

echo "Step 2: Get payment packages...\n";

$ch = curl_init("$baseUrl/payments/packages");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    "Authorization: Bearer $authToken"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    die("Get packages failed! HTTP Code: $httpCode\nResponse: $response\n");
}

$packagesResult = json_decode($response, true);
if (!isset($packagesResult['success']) || !$packagesResult['success']) {
    die("Get packages failed!\nResponse: $response\n");
}

echo "✅ Packages retrieved successfully!\n";
$monthlyPlan = $packagesResult['data']['packages']['landlord_with_tenants']['plans'][0];
echo "Monthly Plan: ₦{$monthlyPlan['amount']} (Plan ID: {$monthlyPlan['plan_id']})\n\n";

echo "Step 3: Initialize payment...\n";

$paymentData = [
    'package_type' => 'landlord_with_tenants',
    'period' => 'monthly',
    'amount' => $monthlyPlan['amount'],
    'plan_id' => $monthlyPlan['plan_id']
];

$ch = curl_init("$baseUrl/payments/initialize");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paymentData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    "Authorization: Bearer $authToken"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    die("Payment initialization failed! HTTP Code: $httpCode\nResponse: $response\n");
}

$initResult = json_decode($response, true);
if (!isset($initResult['success']) || !$initResult['success']) {
    die("Payment initialization failed!\nResponse: $response\n");
}

$txRef = $initResult['data']['tx_ref'];
$paymentId = $initResult['data']['payment_id'];

echo "✅ Payment initialized successfully!\n";
echo "TX Ref: $txRef\n";
echo "Payment ID: $paymentId\n\n";

echo "Step 4: Verify payment (simulating successful Flutterwave callback)...\n";

$ch = curl_init("$baseUrl/payments/verify/$txRef");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    "Authorization: Bearer $authToken"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Verification Response Code: $httpCode\n";

if ($httpCode !== 200) {
    echo "⚠️  Verification returned non-200 status\n";
    echo "Response: $response\n\n";
} else {
    $verifyResult = json_decode($response, true);
    if (isset($verifyResult['success']) && $verifyResult['success']) {
        echo "✅ Payment verified successfully!\n";
        echo "Payment Count: {$verifyResult['data']['user_payment_count']}\n";
        echo "Months Added: {$verifyResult['data']['months_added']}\n";
        echo "Payment Status: {$verifyResult['data']['payment']['status']}\n";
        echo "Subscription Status: {$verifyResult['data']['subscription']['status']}\n\n";
        
        if ($verifyResult['data']['payment']['status'] === 'paid' && 
            $verifyResult['data']['subscription']['status'] === 'active') {
            echo "🎉 SUCCESS! Payment flow is working end-to-end!\n";
        } else {
            echo "❌ Payment or subscription status is incorrect!\n";
        }
    } else {
        echo "❌ Verification failed!\n";
        echo "Response: $response\n";
    }
}

echo "\n=== TEST COMPLETE ===\n";
