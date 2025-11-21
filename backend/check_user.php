<?php
// Simple user check
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = \App\Models\User::where('email', 'yungtee5333@gmail.com')->first();
if ($user) {
    echo "User ID: {$user->id}\n";
    echo "Payment Count: {$user->payment_count}\n";
    echo "Role: {$user->role}\n";
    echo "Up to Date: " . ($user->is_payment_up_to_date ? 'Yes' : 'No') . "\n";
} else {
    echo "User not found\n";
}
?>