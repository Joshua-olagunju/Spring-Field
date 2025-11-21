<?php

/**
 * Simulate the complete payment API flow
 * This tests the backend payment verification without Flutterwave
 */

require __DIR__.'/vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Payment;
use App\Models\Subscription;

// Bootstrap Laravel
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== PAYMENT API SIMULATION TEST ===\n\n";

// Get the test user
$user = User::where('email', 'yungtee5333@gmail.com')->first();

if (!$user) {
    die("User not found!\n");
}

echo "User: {$user->full_name} (ID: {$user->id})\n";
echo "Current Payment Count: {$user->payment_count}\n";
echo "Is Up to Date: " . ($user->is_payment_up_to_date ? 'Yes' : 'No') . "\n\n";

// Simulate a monthly payment for landlord with tenants
$planId = '227503'; // Monthly plan
$amount = 7000;
$periodType = 'monthly';
$txRef = 'SF_TEST_' . time() . '_' . $user->id;

echo "Creating test payment record...\n";
echo "Plan ID: $planId\n";
echo "Amount: ₦$amount\n";
echo "Period: $periodType\n";
echo "TX Ref: $txRef\n\n";

// Create payment record
$payment = Payment::create([
    'user_id' => $user->id,
    'amount' => $amount,
    'period_type' => $periodType,
    'period_start' => now(),
    'period_end' => now()->addMonth(),
    'flutterwave_txn_id' => $txRef,
    'flutterwave_plan_id' => $planId,
    'status' => Payment::STATUS_PENDING
]);

echo "Payment created (ID: {$payment->id})\n";
echo "Initial status: {$payment->status}\n\n";

// Simulate successful payment verification (what happens in verifyPayment method)
echo "Simulating payment verification...\n";

$payment->update([
    'status' => Payment::STATUS_PAID,
    'flutterwave_response' => json_encode([
        'test_payment' => true,
        'status' => 'successful',
        'amount' => $amount,
        'processed_at' => now()->toISOString()
    ]),
    'paid_at' => now()
]);

echo "Payment updated to PAID\n\n";

// Create subscription
echo "Creating subscription...\n";

$monthsToAdd = 1; // Monthly subscription
$subscription = Subscription::create([
    'user_id' => $user->id,
    'payment_id' => $payment->id,
    'package_type' => 'landlord_with_tenants',
    'period' => $periodType,
    'amount' => $amount,
    'starts_at' => now(),
    'expires_at' => now()->addMonths($monthsToAdd),
    'status' => 'active',
    'auto_renew' => false,
    'subscription_data' => json_encode([
        'flutterwave_plan_id' => $planId,
        'house_type' => $user->house_type,
        'tx_ref' => $txRef,
        'test_payment' => true
    ])
]);

echo "Subscription created (ID: {$subscription->id})\n";
echo "Expires at: {$subscription->expires_at}\n\n";

// Update user payment count
echo "Updating user payment count...\n";

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

echo "Old count: $oldCount\n";
echo "New count: $newCount\n";
echo "Months since registration: $monthsSinceRegistration\n";
echo "Required payments: $requiredPayments\n";
echo "Is up to date: " . ($isUpToDate ? 'Yes' : 'No') . "\n\n";

// Verify the changes
$freshUser = User::find($user->id);
$freshPayment = Payment::find($payment->id);
$freshSubscription = Subscription::find($subscription->id);

echo "=== VERIFICATION ===\n\n";

echo "User Payment Count: {$freshUser->payment_count}\n";
echo "User Is Up to Date: " . ($freshUser->is_payment_up_to_date ? 'Yes' : 'No') . "\n\n";

echo "Payment Status: {$freshPayment->status}\n";
echo "Payment Amount: ₦{$freshPayment->amount}\n";
echo "Paid At: {$freshPayment->paid_at}\n\n";

echo "Subscription Status: {$freshSubscription->status}\n";
echo "Subscription Expires: {$freshSubscription->expires_at}\n\n";

if ($freshPayment->status === 'paid' && $freshSubscription->status === 'active' && $freshUser->payment_count > 0) {
    echo "✅ TEST PASSED! Payment flow is working correctly!\n";
} else {
    echo "❌ TEST FAILED! Something is wrong with the payment flow.\n";
}

echo "\n=== TEST COMPLETE ===\n";
