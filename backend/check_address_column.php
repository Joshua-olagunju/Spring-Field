<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "=== Checking Users Table Structure ===\n\n";

// Get all columns
$columns = Schema::getColumnListing('users');
echo "All columns: " . implode(', ', $columns) . "\n\n";

// Check if address exists
echo "Has 'address' column: " . (in_array('address', $columns) ? 'YES' : 'NO') . "\n\n";

// Get column type
if (in_array('address', $columns)) {
    $columnType = DB::select("SHOW COLUMNS FROM users LIKE 'address'");
    echo "Address column details:\n";
    print_r($columnType);
}

// Check a sample user
$user = App\Models\User::where('role', 'landlord')->first();
if ($user) {
    echo "\n=== Sample Landlord User ===\n";
    echo "ID: {$user->id}\n";
    echo "Name: {$user->full_name}\n";
    echo "Current Address: " . ($user->address ?? 'NULL') . "\n";
    echo "Role: {$user->role}\n";
    
    // Try to update
    echo "\n=== Testing Update ===\n";
    $oldAddress = $user->address;
    echo "Old address: {$oldAddress}\n";
    
    $testAddress = "TEST ADDRESS - " . time();
    $user->address = $testAddress;
    $saved = $user->save();
    
    echo "Save result: " . ($saved ? 'SUCCESS' : 'FAILED') . "\n";
    
    // Refresh and check
    $user->refresh();
    echo "Address after refresh: {$user->address}\n";
    echo "Update worked: " . ($user->address === $testAddress ? 'YES' : 'NO') . "\n";
    
    // Restore old address
    $user->address = $oldAddress;
    $user->save();
    echo "\nRestored original address.\n";
}
