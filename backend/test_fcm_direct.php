<?php

require __DIR__ . '/vendor/autoload.php';

use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

try {
    echo "🔥 Testing Firebase FCM Direct...\n\n";
    
    $serviceAccountPath = __DIR__ . '/storage/app/firebase/serviceAccountKey.json';
    
    if (!file_exists($serviceAccountPath)) {
        die("❌ Service account file not found at: $serviceAccountPath\n");
    }
    
    echo "✅ Service account file found\n";
    
    $factory = (new Factory)->withServiceAccount($serviceAccountPath);
    echo "✅ Factory created\n";
    
    $messaging = $factory->createMessaging();
    echo "✅ Messaging instance created\n";
    
    // Test FCM token from your logs
    $fcmToken = 'cLhOoZNWeZglp3t7swjtG-:APA91bGewavj2N8cGKkul-HXAj7shJdAlk1WH0QDXJ6hupWqJ_d7F8UlyOsnt11G1grCspHag1kIxT5h1Bqb6Q-lceG0AnqA-EJSn6wt8aZIdI5S0KAZ2-k';
    
    $notification = Notification::create('Test from PHP', 'Direct PHP test notification');
    echo "✅ Notification created\n";
    
    $message = CloudMessage::withTarget('token', $fcmToken)
        ->withNotification($notification);
    
    echo "✅ Message created\n";
    echo "📤 Sending notification...\n";
    
    $result = $messaging->send($message);
    
    echo "✅ SUCCESS! Notification sent!\n";
    echo "Result: " . print_r($result, true) . "\n";
    
} catch (\Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
}
