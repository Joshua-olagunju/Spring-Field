<?php

// Quick test script for Flutterwave integration
// Run this with: php test_flutterwave.php

require_once __DIR__ . '/vendor/autoload.php';

// Load environment
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value, '"\'');
        }
    }
}

echo "🔧 FLUTTERWAVE INTEGRATION TEST\n";
echo "===============================\n\n";

// Check environment variables
echo "1. ✅ Checking Environment Variables:\n";
$requiredVars = [
    'FLUTTERWAVE_PUBLIC_KEY',
    'FLUTTERWAVE_SECRET_KEY', 
    'FLUTTERWAVE_WEBHOOK_SECRET_HASH'
];

$allVarsPresent = true;
foreach ($requiredVars as $var) {
    if (isset($_ENV[$var]) && !empty($_ENV[$var])) {
        $maskedValue = substr($_ENV[$var], 0, 10) . '...' . substr($_ENV[$var], -4);
        echo "   ✅ $var: $maskedValue\n";
    } else {
        echo "   ❌ $var: MISSING\n";
        $allVarsPresent = false;
    }
}

if (!$allVarsPresent) {
    echo "\n❌ FAILED: Please set all required environment variables in .env file\n";
    exit(1);
}

echo "\n2. 🌐 Testing Flutterwave API Connection:\n";

// Test API connection
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.flutterwave.com/v3/transactions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $_ENV['FLUTTERWAVE_SECRET_KEY'],
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo "   [SUCCESS] API Connection: WORKING\n";
    $data = json_decode($response, true);
    echo "   Status: " . ($data['status'] ?? 'unknown') . "\n";
} else {
    echo "   [ERROR] API Connection: FAILED (HTTP $httpCode)\n";
    echo "   Response: " . substr($response, 0, 200) . "...\n";
}

echo "\n3. 🔐 Testing Payment Initialization:\n";

// Test payment initialization
$testData = [
    'tx_ref' => 'test_' . time(),
    'amount' => '100',
    'currency' => 'NGN',
    'redirect_url' => 'https://example.com/success',
    'customer' => [
        'email' => 'test@example.com',
        'phonenumber' => '08012345678',
        'name' => 'Test User'
    ],
    'customizations' => [
        'title' => 'Test Payment',
        'description' => 'Testing payment integration'
    ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.flutterwave.com/v3/payments');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $_ENV['FLUTTERWAVE_SECRET_KEY'],
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if (isset($data['status']) && $data['status'] === 'success') {
        echo "   ✅ Payment Initialization: SUCCESS\n";
        echo "   🔗 Payment Link: " . ($data['data']['link'] ?? 'N/A') . "\n";
    } else {
        echo "   ❌ Payment Initialization: FAILED\n";
        echo "   📝 Message: " . ($data['message'] ?? 'Unknown error') . "\n";
    }
} else {
    echo "   ❌ Payment Initialization: FAILED (HTTP $httpCode)\n";
    echo "   📝 Response: " . substr($response, 0, 200) . "...\n";
}

echo "\n4. 🗄️ Testing Database Connection:\n";

try {
    $host = $_ENV['DB_HOST'] ?? 'localhost';
    $dbname = $_ENV['DB_DATABASE'] ?? '';
    $username = $_ENV['DB_USERNAME'] ?? '';
    $password = $_ENV['DB_PASSWORD'] ?? '';
    
    if (empty($dbname)) {
        echo "   ❌ Database: NO DB_DATABASE in .env\n";
    } else {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        echo "   ✅ Database Connection: SUCCESS\n";
        
        // Check if payments table exists
        $stmt = $pdo->query("SHOW TABLES LIKE 'payments'");
        if ($stmt->rowCount() > 0) {
            echo "   ✅ Payments Table: EXISTS\n";
        } else {
            echo "   ❌ Payments Table: NOT FOUND - Run 'php artisan migrate'\n";
        }
    }
} catch (PDOException $e) {
    echo "   ❌ Database Connection: FAILED\n";
    echo "   📝 Error: " . $e->getMessage() . "\n";
}

echo "\n5. 📱 Frontend Environment Check:\n";

// Check frontend .env file
$frontendEnv = dirname(__DIR__) . '/.env';
if (file_exists($frontendEnv)) {
    $lines = file($frontendEnv, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $frontendVars = [];
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $frontendVars[trim($key)] = trim($value, '"\'');
        }
    }
    
    if (isset($frontendVars['VITE_FLUTTERWAVE_PUBLIC_KEY']) && !empty($frontendVars['VITE_FLUTTERWAVE_PUBLIC_KEY'])) {
        $maskedKey = substr($frontendVars['VITE_FLUTTERWAVE_PUBLIC_KEY'], 0, 10) . '...';
        echo "   ✅ Frontend Public Key: $maskedKey\n";
    } else {
        echo "   ❌ Frontend Public Key: MISSING VITE_FLUTTERWAVE_PUBLIC_KEY\n";
    }
    
    if (isset($frontendVars['API_BASE_URL']) && !empty($frontendVars['API_BASE_URL'])) {
        echo "   ✅ API Base URL: " . $frontendVars['API_BASE_URL'] . "\n";
    } else {
        echo "   ❌ API Base URL: MISSING\n";
    }
} else {
    echo "   ❌ Frontend .env: NOT FOUND\n";
}

echo "\n===============================\n";
echo "🎯 SUMMARY:\n";

if ($allVarsPresent && $httpCode === 200) {
    echo "✅ Your Flutterwave setup is working!\n";
    echo "\n🚀 Next Steps:\n";
    echo "1. Start your Laravel server: php artisan serve\n";
    echo "2. Start your frontend: npm run dev\n";
    echo "3. Test payment flow in your app\n";
    echo "4. Monitor logs: tail -f storage/logs/laravel.log\n";
} else {
    echo "❌ Setup needs attention. Check the failed items above.\n";
    echo "\n📖 Read the FLUTTERWAVE_SETUP_GUIDE.md for detailed instructions.\n";
}

echo "\n🔗 Useful Links:\n";
echo "- Flutterwave Dashboard: https://dashboard.flutterwave.com/\n";
echo "- API Documentation: https://developer.flutterwave.com/docs\n";
echo "- Test Cards: Check FLUTTERWAVE_SETUP_GUIDE.md\n";

?>