<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

DB::table('subscriptions')->where('user_id', 35)->delete();
DB::table('payments')->where('user_id', 35)->delete();
DB::table('users')->where('id', 35)->update(['payment_count' => 0]);

echo "✅ Database cleaned for user ID 35. Ready for manual testing!\n";
