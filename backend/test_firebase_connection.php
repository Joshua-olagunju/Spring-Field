<?php

require_once 'vendor/autoload.php';

use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

try {
    echo "Testing Firebase Connection...\n";
    
    // Path to your Firebase service account JSON file
    $serviceAccountPath = 'storage/app/firebase/serviceAccountKey.json';
    
    if (!file_exists($serviceAccountPath)) {
        echo "❌ Firebase service account file not found at: $serviceAccountPath\n";
        exit(1);
    }
    
    echo "✅ Firebase service account file found\n";
    
    $factory = (new Factory)->withServiceAccount($serviceAccountPath);
    $messaging = $factory->createMessaging();
    
    echo "✅ Firebase messaging service initialized successfully\n";
    
    // Test with a dummy token (this should fail gracefully)
    $testToken = 'dummy_test_token_12345';
    $notification = Notification::create('Test Title', 'Test Body');
    
    $message = CloudMessage::withTarget('token', $testToken)
        ->withNotification($notification)
        ->withData(['test' => true]);
    
    try {
        $messaging->send($message);
        echo "❌ Unexpected: Message sent to dummy token\n";
    } catch (\Exception $e) {
        // This should fail because it's a dummy token
        if (strpos($e->getMessage(), 'token') !== false || strpos($e->getMessage(), 'not found') !== false) {
            echo "✅ Firebase messaging working correctly (dummy token rejected as expected)\n";
        } else {
            echo "❌ Unexpected Firebase error: " . $e->getMessage() . "\n";
        }
    }
    
} catch (\Exception $e) {
    echo "❌ Firebase initialization error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}

echo "\n✅ Firebase setup test completed successfully!\n";