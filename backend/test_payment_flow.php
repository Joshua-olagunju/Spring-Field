<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Payment;
use App\Models\User;

echo "=== PAYMENT FRONTEND SIMULATION ===\n";

// Simulate a frontend payment attempt
$userId = 39;
$user = User::find($userId);

if (!$user) {
    echo "User not found\n";
    exit;
}

echo "User: {$user->full_name} (ID: {$user->id})\n";
echo "Current Payment Count: {$user->payment_count}\n";
echo "Is Up to Date: " . ($user->is_payment_up_to_date ? 'Yes' : 'No') . "\n";

// Simulate what happens when frontend calls verifyPayment with a new transaction
$newTxRef = 'SF_' . time() . '_' . $user->id . '_TEST123';
echo "\nSimulating payment verification with tx_ref: {$newTxRef}\n";

// Check if payment exists
$existingPayment = Payment::where('flutterwave_txn_id', $newTxRef)
                         ->where('user_id', $user->id)
                         ->first();

if ($existingPayment) {
    echo "Payment record found: ID {$existingPayment->id}\n";
} else {
    echo "No payment record found - this is the issue!\n";
    echo "The frontend is calling verifyPayment without first calling initializePayment\n";
    
    // This is what should happen - create a payment record first
    echo "\nCreating payment record as verifyPayment method does...\n";
    $payment = Payment::create([
        'user_id' => $user->id,
        'amount' => 0, // Will be updated from Flutterwave response
        'period_type' => 'monthly',
        'period_start' => now(),
        'period_end' => now()->addMonth(),
        'flutterwave_txn_id' => $newTxRef,
        'flutterwave_plan_id' => null,
        'status' => Payment::STATUS_PENDING
    ]);
    
    echo "Created payment record ID: {$payment->id}\n";
}

echo "\n=== DIAGNOSIS ===\n";
echo "The payment system works correctly when:\n";
echo "1. A payment record exists (either from initialize or created in verify)\n";
echo "2. Flutterwave verification succeeds\n";
echo "3. Subscription and user tracking get updated\n";
echo "\nThe issue is likely that:\n";
echo "1. Frontend doesn't call /api/payments/initialize first\n";
echo "2. Or there's a mismatch in transaction references\n";
echo "3. Or Flutterwave test payments are not being verified properly\n";

echo "\n=== END SIMULATION ===\n";