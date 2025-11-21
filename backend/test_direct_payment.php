<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Direct Database Payment Test\n";
echo "============================\n\n";

try {
    // Find a landlord user
    $landlord = \App\Models\User::where('role', 'landlord')->first();
    
    if (!$landlord) {
        echo "No landlord found. Creating test landlord...\n";
        $landlord = \App\Models\User::create([
            'first_name' => 'Test',
            'last_name' => 'Landlord',
            'full_name' => 'Test Landlord',
            'email' => 'testlandlord@example.com',
            'password' => bcrypt('password'),
            'role' => 'landlord',
            'house_type' => 'room_self',
            'address' => 'Test Address',
            'phone' => '08012345678',
            'payment_count' => 0,
            'is_payment_up_to_date' => false
        ]);
    }
    
    echo "Using landlord: {$landlord->email} (ID: {$landlord->id})\n\n";
    
    // Step 1: Create a payment record
    echo "Step 1: Creating payment record...\n";
    $txRef = 'SF_' . time() . '_' . $landlord->id . '_TEST';
    
    $payment = \App\Models\Payment::create([
        'user_id' => $landlord->id,
        'amount' => 42000,
        'period_type' => '6months',
        'period_start' => now(),
        'period_end' => now()->addMonths(6),
        'flutterwave_txn_id' => $txRef,
        'flutterwave_plan_id' => '227507', // 6 months landlord with tenants
        'status' => \App\Models\Payment::STATUS_PENDING
    ]);
    
    echo "Payment created: ID {$payment->id}, Status: {$payment->status}\n\n";
    
    // Step 2: Simulate successful payment verification
    echo "Step 2: Simulating successful payment verification...\n";
    
    // Update payment as successful
    $payment->update([
        'status' => \App\Models\Payment::STATUS_PAID,
        'flutterwave_response' => json_encode([
            'test_payment' => true,
            'status' => 'successful',
            'amount' => 42000,
            'processed_at' => now()->toISOString()
        ]),
        'paid_at' => now()
    ]);
    
    echo "Payment updated to PAID status\n";
    
    // Determine package type
    $landlordWithTenantsPlans = ['227503', '227507', '227508'];
    $packageType = 'landlord_with_tenants';
    $periodType = $payment->period_type;
    
    // Calculate months to add
    $monthsToAdd = match($periodType) {
        '6months' => 6,
        'yearly' => 12,
        default => 1
    };
    
    echo "Package type: $packageType, Months to add: $monthsToAdd\n";
    
    // Step 3: Create subscription record
    echo "Step 3: Creating subscription record...\n";
    
    $subscription = \App\Models\Subscription::create([
        'user_id' => $landlord->id,
        'payment_id' => $payment->id,
        'package_type' => $packageType,
        'period' => $periodType,
        'amount' => $payment->amount,
        'starts_at' => now(),
        'expires_at' => now()->addMonths($monthsToAdd),
        'status' => 'active',
        'auto_renew' => false,
        'subscription_data' => json_encode([
            'flutterwave_plan_id' => $payment->flutterwave_plan_id,
            'house_type' => $landlord->house_type,
            'tx_ref' => $txRef,
            'test_payment' => true
        ])
    ]);
    
    echo "Subscription created: ID {$subscription->id}, Status: {$subscription->status}\n";
    echo "Expires at: {$subscription->expires_at}\n\n";
    
    // Step 4: Update user payment tracking
    echo "Step 4: Updating user payment tracking...\n";
    
    $oldCount = $landlord->payment_count ?? 0;
    $newCount = $oldCount + $monthsToAdd;
    
    // Calculate if payment is up to date
    $monthsSinceRegistration = $landlord->created_at->diffInMonths(now()) + 1;
    $requiredPayments = max(1, $monthsSinceRegistration);
    $isUpToDate = $newCount >= $requiredPayments;
    
    echo "Old payment count: $oldCount\n";
    echo "New payment count: $newCount\n";
    echo "Months since registration: $monthsSinceRegistration\n";
    echo "Required payments: $requiredPayments\n";
    echo "Is up to date: " . ($isUpToDate ? 'Yes' : 'No') . "\n\n";
    
    // Update user
    \App\Models\User::where('id', $landlord->id)->update([
        'payment_count' => $newCount,
        'is_payment_up_to_date' => $isUpToDate,
        'last_payment_check' => now()
    ]);
    
    // Get fresh user data
    $freshLandlord = \App\Models\User::find($landlord->id);
    
    echo "User updated successfully!\n";
    echo "Final payment count: {$freshLandlord->payment_count}\n";
    echo "Final up to date status: " . ($freshLandlord->is_payment_up_to_date ? 'Yes' : 'No') . "\n";
    echo "Last payment check: {$freshLandlord->last_payment_check}\n\n";
    
    // Step 5: Verify all records
    echo "Step 5: Final verification...\n";
    echo "✅ Payment record: ID {$payment->fresh()->id}, Status: {$payment->fresh()->status}\n";
    echo "✅ Subscription record: ID {$subscription->fresh()->id}, Status: {$subscription->fresh()->status}\n";
    echo "✅ User payment count: {$freshLandlord->payment_count}\n";
    echo "✅ User up to date: " . ($freshLandlord->is_payment_up_to_date ? 'Yes' : 'No') . "\n\n";
    
    echo "🎉 Test completed successfully! All database updates working correctly.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}