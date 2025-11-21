<?php

require_once 'vendor/autoload.php';

// Test payment verification directly
$baseUrl = 'http://127.0.0.1:8000/api';

// Test data - we'll create a test payment directly
$testTxRef = 'SF_' . time() . '_35_TEST'; // Generate test tx_ref
$authToken = null; // We'll test without auth first

echo "Testing Payment Verification\n";
echo "============================\n\n";

// Test 1: Initialize a payment first
echo "Step 1: Initialize Payment\n";
$initData = [
    'package_type' => 'landlord_with_tenants',
    'period' => '6months',
    'amount' => 42000,
    'plan_id' => '227507'
];

$initCurl = curl_init();
curl_setopt_array($initCurl, [
    CURLOPT_URL => $baseUrl . '/payments/initialize',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($initData),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $authToken
    ]
]);

$initResponse = curl_exec($initCurl);
$initResult = json_decode($initResponse, true);
curl_close($initCurl);

echo "Initialize Response: " . json_encode($initResult, JSON_PRETTY_PRINT) . "\n\n";

if ($initResult && $initResult['success']) {
    $txRef = $initResult['data']['tx_ref'];
    echo "Generated tx_ref: $txRef\n\n";
    
    // Step 2: Verify the payment
    echo "Step 2: Verify Payment\n";
    $verifyCurl = curl_init();
    curl_setopt_array($verifyCurl, [
        CURLOPT_URL => $baseUrl . '/payments/verify/' . $txRef,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $authToken
        ]
    ]);

    $verifyResponse = curl_exec($verifyCurl);
    $verifyResult = json_decode($verifyResponse, true);
    $httpCode = curl_getinfo($verifyCurl, CURLINFO_HTTP_CODE);
    curl_close($verifyCurl);

    echo "Verify HTTP Code: $httpCode\n";
    echo "Verify Response: " . json_encode($verifyResult, JSON_PRETTY_PRINT) . "\n\n";
    
    // Step 3: Check database records
    echo "Step 3: Check Database Records\n";
    try {
        $app = require_once 'bootstrap/app.php';
        $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
        
        $payment = \App\Models\Payment::where('flutterwave_txn_id', $txRef)->first();
        if ($payment) {
            echo "Payment Record Found:\n";
            echo "- ID: {$payment->id}\n";
            echo "- Status: {$payment->status}\n";
            echo "- Amount: {$payment->amount}\n";
            echo "- User ID: {$payment->user_id}\n";
            echo "- Plan ID: {$payment->flutterwave_plan_id}\n";
            echo "- Created: {$payment->created_at}\n";
            echo "- Updated: {$payment->updated_at}\n\n";
            
            $subscription = \App\Models\Subscription::where('payment_id', $payment->id)->first();
            if ($subscription) {
                echo "Subscription Record Found:\n";
                echo "- ID: {$subscription->id}\n";
                echo "- Package Type: {$subscription->package_type}\n";
                echo "- Status: {$subscription->status}\n";
                echo "- Starts: {$subscription->starts_at}\n";
                echo "- Expires: {$subscription->expires_at}\n\n";
            } else {
                echo "No subscription record found!\n\n";
            }
            
            $user = \App\Models\User::find($payment->user_id);
            if ($user) {
                echo "User Record:\n";
                echo "- ID: {$user->id}\n";
                echo "- Email: {$user->email}\n";
                echo "- Role: {$user->role}\n";
                echo "- Payment Count: {$user->payment_count}\n";
                echo "- Is Up to Date: " . ($user->is_payment_up_to_date ? 'Yes' : 'No') . "\n";
                echo "- Last Payment Check: {$user->last_payment_check}\n";
            }
        } else {
            echo "No payment record found for tx_ref: $txRef\n";
        }
    } catch (Exception $e) {
        echo "Database check error: " . $e->getMessage() . "\n";
    }
} else {
    echo "Payment initialization failed!\n";
}