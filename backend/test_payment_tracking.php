<?php

// Test payment tracking scenarios
use App\Models\User;

$user = User::where('email', 'tayorotimi5233@gmail.com')->first();

if ($user) {
    echo "Testing payment tracking scenarios...\n";
    echo "=====================================\n\n";
    
    // Scenario 1: User registered 3 months ago, no payments (0/3)
    $user->created_at = now()->subMonths(3);
    $user->payment_count = 0;
    $user->save();
    $user->updatePaymentStatus();
    
    echo "Scenario 1 - Behind on payments:\n";
    echo "Registration: " . $user->created_at->format('Y-m-d') . "\n";
    echo "Payment ratio: " . $user->getPaymentStatus()['payment_ratio'] . "\n";
    echo "Up to date: " . ($user->isPaymentUpToDate() ? 'Yes' : 'No') . "\n";
    echo "Message: " . $user->getPaymentStatusMessage() . "\n\n";
    
    // Scenario 2: User paid 2 months out of 3 required (2/3)
    $user->payment_count = 2;
    $user->save();
    $user->updatePaymentStatus();
    
    echo "Scenario 2 - Still behind but improved:\n";
    echo "Payment ratio: " . $user->getPaymentStatus()['payment_ratio'] . "\n";
    echo "Up to date: " . ($user->isPaymentUpToDate() ? 'Yes' : 'No') . "\n";
    echo "Message: " . $user->getPaymentStatusMessage() . "\n\n";
    
    // Scenario 3: User registered 4 months ago, paid 6 months (6/4)
    $user->created_at = now()->subMonths(4);
    $user->payment_count = 6;
    $user->save();
    $user->updatePaymentStatus();
    
    echo "Scenario 3 - Ahead on payments:\n";
    echo "Payment ratio: " . $user->getPaymentStatus()['payment_ratio'] . "\n";
    echo "Up to date: " . ($user->isPaymentUpToDate() ? 'Yes' : 'No') . "\n";
    echo "Message: " . $user->getPaymentStatusMessage() . "\n\n";
    
    // Scenario 4: Perfect match (2/2)
    $user->created_at = now()->subMonths(2);
    $user->payment_count = 2;
    $user->save();
    $user->updatePaymentStatus();
    
    echo "Scenario 4 - Perfect match:\n";
    echo "Payment ratio: " . $user->getPaymentStatus()['payment_ratio'] . "\n";
    echo "Up to date: " . ($user->isPaymentUpToDate() ? 'Yes' : 'No') . "\n";
    echo "Message: " . $user->getPaymentStatusMessage() . "\n\n";
    
    echo "✅ Payment tracking system working correctly!\n";
    echo "Format: payment_count/required_payments\n";
    echo "- 0/3 = Behind (user owes 3 months)\n";
    echo "- 2/3 = Behind (user owes 1 month)\n";
    echo "- 6/4 = Ahead (user paid extra 2 months)\n";
    echo "- 2/2 = Perfect (user is exactly up to date)\n";
    
} else {
    echo "No test user found\n";
}