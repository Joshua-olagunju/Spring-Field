<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Testing Payment Verification API\n";
echo "================================\n\n";

try {
    // Find the landlord user
    $landlord = \App\Models\User::where('email', 'yungtee5333@gmail.com')->first();
    
    if (!$landlord) {
        echo "Landlord not found!\n";
        exit;
    }
    
    echo "Using landlord: {$landlord->email} (ID: {$landlord->id})\n\n";
    
    // Step 1: Create a payment record manually (simulating initialization)
    echo "Step 1: Creating test payment record...\n";
    $txRef = 'SF_' . time() . '_' . $landlord->id . '_API_TEST';
    
    $payment = \App\Models\Payment::create([
        'user_id' => $landlord->id,
        'amount' => 7000, // Monthly plan
        'period_type' => 'monthly',
        'period_start' => now(),
        'period_end' => now()->addMonth(),
        'flutterwave_txn_id' => $txRef,
        'flutterwave_plan_id' => '227503', // Monthly landlord with tenants
        'status' => \App\Models\Payment::STATUS_PENDING
    ]);
    
    echo "Payment created: ID {$payment->id}, tx_ref: {$txRef}\n\n";
    
    // Step 2: Call the verification API directly
    echo "Step 2: Testing verification API...\n";
    
    // Create a mock request
    $request = new \Illuminate\Http\Request();
    $request->setUserResolver(function() use ($landlord) {
        return $landlord;
    });
    
    // Call the PaymentController verification method
    $controller = new \App\Http\Controllers\Api\PaymentController();
    
    // Mock the Auth::user() method
    \Illuminate\Support\Facades\Auth::shouldReceive('user')->andReturn($landlord);
    
    $response = $controller->verifyPayment($txRef);
    $responseData = $response->getData(true);
    
    echo "API Response: " . json_encode($responseData, JSON_PRETTY_PRINT) . "\n\n";
    
    // Step 3: Check final database state
    echo "Step 3: Checking final database state...\n";
    
    $payment = $payment->fresh();
    echo "Payment status: {$payment->status}\n";
    
    $subscription = \App\Models\Subscription::where('payment_id', $payment->id)->first();
    if ($subscription) {
        echo "Subscription created: ID {$subscription->id}, Status: {$subscription->status}\n";
        echo "Package type: {$subscription->package_type}\n";
        echo "Expires: {$subscription->expires_at}\n";
    } else {
        echo "❌ No subscription record found!\n";
    }
    
    $landlord = $landlord->fresh();
    echo "User payment count: {$landlord->payment_count}\n";
    echo "User up to date: " . ($landlord->is_payment_up_to_date ? 'Yes' : 'No') . "\n";
    
    if ($responseData['success']) {
        echo "\n🎉 Payment verification API working correctly!\n";
    } else {
        echo "\n❌ Payment verification API failed!\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}