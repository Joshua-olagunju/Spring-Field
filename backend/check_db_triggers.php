<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Checking for Database Triggers ===\n\n";

$triggers = DB::select("SHOW TRIGGERS WHERE `Table` = 'users'");

if (empty($triggers)) {
    echo "No triggers found on users table.\n";
} else {
    echo "Triggers found:\n";
    print_r($triggers);
}

echo "\n=== Checking User Model Attributes ===\n\n";

$user = App\Models\User::where('role', 'landlord')->first();

echo "Fillable attributes:\n";
print_r($user->getFillable());

echo "\nGuarded attributes:\n";
print_r($user->getGuarded());

echo "\nHidden attributes:\n";
print_r($user->getHidden());

echo "\n=== Direct Database Update Test ===\n\n";

$userId = $user->id;
$testAddress = "DIRECT DB UPDATE - " . time();

echo "User ID: {$userId}\n";
echo "Old address (from model): {$user->address}\n";

// Direct database update
$affected = DB::table('users')
    ->where('id', $userId)
    ->update(['address' => $testAddress]);

echo "Rows affected: {$affected}\n";

// Query directly from database
$dbAddress = DB::table('users')
    ->where('id', $userId)
    ->value('address');

echo "Address in database (direct query): {$dbAddress}\n";
echo "Direct DB update worked: " . ($dbAddress === $testAddress ? 'YES' : 'NO') . "\n";

// Check via Eloquent
$user->refresh();
echo "Address via Eloquent refresh: {$user->address}\n";

// Restore
DB::table('users')
    ->where('id', $userId)
    ->update(['address' => 'Plot 10, Tawas Hotel, Off Sagamu road.']);

echo "\nRestored original address.\n";
