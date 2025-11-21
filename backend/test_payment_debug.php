<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;

echo "=== PAYMENT SYSTEM DEBUG ===\n";

echo "\n--- Payment Records ---\n";
$payments = Payment::all();
foreach ($payments as $payment) {
    echo "ID: {$payment->id}, User: {$payment->user_id}, TxRef: {$payment->flutterwave_txn_id}, Status: {$payment->status}, Amount: {$payment->amount}\n";
}

echo "\n--- Subscription Records ---\n";
$subscriptions = Subscription::all();
foreach ($subscriptions as $subscription) {
    echo "ID: {$subscription->id}, User: {$subscription->user_id}, Payment: {$subscription->payment_id}, Status: {$subscription->status}, Amount: {$subscription->amount}\n";
}

echo "\n--- User Payment Status ---\n";
$user = User::find(39);
if ($user) {
    echo "User ID: {$user->id}\n";
    echo "Payment Count: {$user->payment_count}\n";
    echo "Is Up to Date: " . ($user->is_payment_up_to_date ? 'Yes' : 'No') . "\n";
    echo "Created: {$user->created_at}\n";
} else {
    echo "User 39 not found\n";
}

echo "\n--- Recent Laravel Logs (last 10 lines) ---\n";
if (file_exists('storage/logs/laravel.log')) {
    $logs = file('storage/logs/laravel.log');
    $recentLogs = array_slice($logs, -10);
    foreach ($recentLogs as $log) {
        echo $log;
    }
} else {
    echo "No Laravel log file found\n";
}

echo "\n=== END DEBUG ===\n";