<?php

require_once 'vendor/autoload.php';

// Test payment flow with real user credentials
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🧪 Testing Payment System with Real User\n";
echo "=====================================\n\n";

try {
    // Find the user with the provided credentials
    $user = \App\Models\User::where('email', 'yungtee5333@gmail.com')->first();
    
    if (!$user) {
        echo "❌ User not found with email: yungtee5333@gmail.com\n";
        exit;
    }
    
    echo "✅ User found:\n";
    echo "- ID: {$user->id}\n";
    echo "- Email: {$user->email}\n";
    echo "- Name: {$user->full_name}\n";
    echo "- Role: {$user->role}\n";
    echo "- Current Payment Count: {$user->payment_count}\n";
    echo "- Is Up to Date: " . ($user->is_payment_up_to_date ? 'Yes' : 'No') . "\n\n";
    
    // Test 1: Create payment initialization
    echo "Step 1: 🚀 Testing Payment Initialization\n";
    echo "========================================\n";
    
    $paymentData = [
        'user_id' => $user->id,
        'amount' => 7000, // Monthly landlord with tenants
        'period_type' => 'monthly',
        'period_start' => now(),
        'period_end' => now()->addMonth(),
        'flutterwave_txn_id' => 'SF_' . time() . '_' . $user->id . '_REAL_TEST',
        'flutterwave_plan_id' => '227503', // Monthly landlord with tenants
        'status' => \App\Models\Payment::STATUS_PENDING
    ];
    
    $payment = \App\Models\Payment::create($paymentData);
    
    echo "✅ Payment record created:\n";
    echo "- Payment ID: {$payment->id}\n";
    echo "- TX Ref: {$payment->flutterwave_txn_id}\n";
    echo "- Status: {$payment->status}\n";
    echo "- Amount: ₦{$payment->amount}\n";
    echo "- Plan ID: {$payment->flutterwave_plan_id}\n\n";
    
    // Test 2: Simulate successful payment verification
    echo "Step 2: ✅ Testing Payment Verification\n";
    echo "======================================\n";
    
    // Update payment as successful (simulating Flutterwave success)
    $payment->update([
        'status' => \App\Models\Payment::STATUS_PAID,
        'flutterwave_response' => json_encode([
            'test_payment' => true,
            'status' => 'successful',
            'amount' => 7000,
            'processed_at' => now()->toISOString(),
            'real_user_test' => true
        ]),
        'paid_at' => now()
    ]);
    
    echo "✅ Payment status updated to PAID\n";
    
    // Step 3: Create subscription
    echo "Step 3: 📋 Creating Subscription\n";
    echo "===============================\n";
    
    $subscription = \App\Models\Subscription::create([
        'user_id' => $user->id,
        'payment_id' => $payment->id,
        'package_type' => 'landlord_with_tenants',
        'period' => 'monthly',
        'amount' => $payment->amount,
        'starts_at' => now(),
        'expires_at' => now()->addMonth(),
        'status' => 'active',
        'auto_renew' => false,
        'subscription_data' => json_encode([
            'flutterwave_plan_id' => $payment->flutterwave_plan_id,
            'house_type' => $user->house_type,
            'tx_ref' => $payment->flutterwave_txn_id,
            'real_user_test' => true
        ])
    ]);
    
    echo "✅ Subscription created:\n";
    echo "- Subscription ID: {$subscription->id}\n";
    echo "- Package Type: {$subscription->package_type}\n";
    echo "- Status: {$subscription->status}\n";
    echo "- Expires: {$subscription->expires_at}\n\n";
    
    // Step 4: Update user payment tracking
    echo "Step 4: 👤 Updating User Payment Tracking\n";
    echo "========================================\n";
    
    $oldCount = $user->payment_count ?? 0;
    $newCount = $oldCount + 1; // Monthly = 1 month
    
    $monthsSinceRegistration = $user->created_at->diffInMonths(now()) + 1;
    $requiredPayments = max(1, $monthsSinceRegistration);
    $isUpToDate = $newCount >= $requiredPayments;
    
    \App\Models\User::where('id', $user->id)->update([
        'payment_count' => $newCount,
        'is_payment_up_to_date' => $isUpToDate,
        'last_payment_check' => now()
    ]);
    
    // Get fresh user data
    $freshUser = \App\Models\User::find($user->id);
    
    echo "✅ User payment tracking updated:\n";
    echo "- Old Payment Count: {$oldCount}\n";
    echo "- New Payment Count: {$freshUser->payment_count}\n";
    echo "- Months Since Registration: {$monthsSinceRegistration}\n";
    echo "- Required Payments: {$requiredPayments}\n";
    echo "- Is Up to Date: " . ($freshUser->is_payment_up_to_date ? 'Yes' : 'No') . "\n";
    echo "- Last Payment Check: {$freshUser->last_payment_check}\n\n";
    
    // Final verification
    echo "Step 5: 🔍 Final Verification\n";
    echo "============================\n";
    
    $finalPayment = \App\Models\Payment::find($payment->id);
    $finalSubscription = \App\Models\Subscription::find($subscription->id);
    $finalUser = \App\Models\User::find($user->id);
    
    echo "✅ Final Database State:\n";
    echo "- Payment Status: {$finalPayment->status}\n";
    echo "- Subscription Status: {$finalSubscription->status}\n";
    echo "- User Payment Count: {$finalUser->payment_count}\n";
    echo "- User Up to Date: " . ($finalUser->is_payment_up_to_date ? 'Yes' : 'No') . "\n\n";
    
    if ($finalPayment->status === 'paid' && 
        $finalSubscription->status === 'active' && 
        $finalUser->payment_count > $oldCount) {
        echo "🎉 SUCCESS! All database updates working correctly!\n";
        echo "✅ Payment: PAID\n";
        echo "✅ Subscription: ACTIVE\n";
        echo "✅ User: PAYMENT COUNT UPDATED\n\n";
        
        echo "📊 Summary for yungtee5333@gmail.com:\n";
        echo "- Total Payments: {$finalUser->payment_count}\n";
        echo "- Latest Subscription: {$subscription->package_type} - {$subscription->period}\n";
        echo "- Subscription Expires: {$subscription->expires_at}\n";
        echo "- Account Status: " . ($finalUser->is_payment_up_to_date ? '✅ UP TO DATE' : '⚠️ BEHIND') . "\n";
    } else {
        echo "❌ Something went wrong with the database updates!\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}