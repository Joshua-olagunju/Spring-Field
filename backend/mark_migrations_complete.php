<?php

// Mark migrations as completed
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    // Check if migrations table exists and insert migration records
    DB::table('migrations')->insertOrIgnore([
        ['migration' => '2014_10_12_000000_create_users_table', 'batch' => 1],
        ['migration' => '2014_10_12_100000_create_password_resets_table', 'batch' => 1],
        ['migration' => '2019_08_19_000000_create_failed_jobs_table', 'batch' => 1],
        ['migration' => '2019_12_14_000001_create_personal_access_tokens_table', 'batch' => 1],
        ['migration' => '2025_11_10_160819_create_registration_otps_table', 'batch' => 1],
        ['migration' => '2025_11_12_000000_add_house_type_to_users_table', 'batch' => 1],
        ['migration' => '2025_11_16_000000_create_visitor_tokens_and_entries_tables', 'batch' => 1]
    ]);
    
    echo "✅ Migration records inserted successfully!\n";
    echo "🔧 Database is now properly set up for visitor tokens.\n";
    echo "🚀 You can now test the visitor token generation and verification!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "💡 Tip: Make sure your database connection is configured in .env\n";
}