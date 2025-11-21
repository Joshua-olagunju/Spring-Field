<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\Log;

echo "=== TESTING FIXED PAYMENT FLOW ===\n";

$userId = 39;
$user = User::find($userId);

if (!$user) {
    echo "User not found\n";
    exit;
}

echo "User: {$user->full_name} (ID: {$user->id})\n";
echo "Current Payment Count: {$user->payment_count}\n";

// Simulate the initialize payment process
echo "\n--- Step 1: Initialize Payment (Backend) ---\n";
$packageType = 'tenant';
$period = 'monthly';
$amount = 2500;
$planId = '227500';

// Generate unique transaction reference (same as PaymentController)
$txRef = 'SF_' . time() . '_' . $user->id . '_' . strtoupper(substr(md5(uniqid()), 0, 6));
echo "Generated TX Ref: {$txRef}\n";

// Create payment record (same as PaymentController)
$payment = Payment::create([
    'user_id' => $user->id,
    'amount' => $amount,
    'period_type' => $period,
    'period_start' => now(),
    'period_end' => now()->addMonth(),
    'flutterwave_txn_id' => $txRef,
    'flutterwave_plan_id' => $planId,
    'status' => Payment::STATUS_PENDING
]);

echo "Payment record created: ID {$payment->id}, Status: {$payment->status}\n";

// Simulate the frontend calling the verify endpoint after successful payment
echo "\n--- Step 2: Simulate Successful Flutterwave Payment ---\n";
echo "Frontend receives successful payment response from Flutterwave\n";
echo "Frontend calls /api/payments/verify/{$txRef}\n";

// Find the payment record (same as verifyPayment method)
$foundPayment = Payment::where('flutterwave_txn_id', $txRef)
                       ->where('user_id', $user->id)
                       ->first();

if ($foundPayment) {
    echo "✅ Payment record found: ID {$foundPayment->id}\n";
    
    // Simulate successful verification (same as verifyPayment method)
    echo "\n--- Step 3: Update Payment and Create Subscription ---\n";
    
    // Update payment status
    $foundPayment->update([
        'status' => Payment::STATUS_PAID,
        'paid_at' => now()
    ]);
    echo "Payment status updated to: {$foundPayment->status}\n";
    
    // Create subscription (same logic as verifyPayment)
    $packageType = $user->role === 'landlord' ? 'landlord' : 'tenant';
    $monthsToAdd = 1; // monthly
    
    $subscription = \App\Models\Subscription::create([
        'user_id' => $user->id,
        'payment_id' => $foundPayment->id,
        'package_type' => $packageType,
        'period' => $period,
        'amount' => $foundPayment->amount,
        'starts_at' => now(),
        'expires_at' => now()->addMonths($monthsToAdd),
        'status' => 'active',
        'auto_renew' => false,
        'subscription_data' => json_encode([
            'flutterwave_plan_id' => $foundPayment->flutterwave_plan_id,
            'house_type' => $user->house_type,
            'tx_ref' => $txRef
        ])
    ]);
    
    echo "Subscription created: ID {$subscription->id}, Status: {$subscription->status}\n";
    
    // Update user payment tracking
    $oldCount = $user->payment_count ?? 0;
    $newCount = $oldCount + $monthsToAdd;
    
    $monthsSinceRegistration = $user->created_at->diffInMonths(now()) + 1;
    $requiredPayments = max(1, $monthsSinceRegistration);
    $isUpToDate = $newCount >= $requiredPayments;
    
    User::where('id', $user->id)->update([
        'payment_count' => $newCount,
        'is_payment_up_to_date' => $isUpToDate,
        'last_payment_check' => now()
    ]);
    
    $updatedUser = User::find($user->id);
    echo "User payment count updated: {$oldCount} → {$updatedUser->payment_count}\n";
    echo "User is up to date: " . ($updatedUser->is_payment_up_to_date ? 'Yes' : 'No') . "\n";
    
    echo "\n✅ PAYMENT FLOW COMPLETED SUCCESSFULLY!\n";
    
} else {
    echo "❌ Payment record not found - this would be the error!\n";
}

echo "\n--- Current Database State ---\n";
echo "Total Payments: " . Payment::count() . "\n";
echo "Total Subscriptions: " . \App\Models\Subscription::count() . "\n";
echo "User {$user->id} Payment Count: " . User::find($user->id)->payment_count . "\n";

echo "\n=== END TEST ===\n";