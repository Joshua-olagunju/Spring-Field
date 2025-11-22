<?php

// Quick test to verify Firebase service account after replacement

require_once 'vendor/autoload.php';

use Kreait\Firebase\Factory;

try {
    echo "Testing real Firebase service account...\n";
    
    $serviceAccountPath = 'storage/app/firebase/serviceAccountKey.json';
    
    if (!file_exists($serviceAccountPath)) {
        echo "❌ Service account file not found\n";
        exit(1);
    }
    
    // Try to read and validate the JSON
    $serviceAccountData = json_decode(file_get_contents($serviceAccountPath), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo "❌ Invalid JSON in service account file: " . json_last_error_msg() . "\n";
        exit(1);
    }
    
    // Check required fields
    $requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email'];
    foreach ($requiredFields as $field) {
        if (!isset($serviceAccountData[$field])) {
            echo "❌ Missing required field: $field\n";
            exit(1);
        }
    }
    
    // Check if private key looks real (not dummy data)
    if (strpos($serviceAccountData['private_key'], 'Y9T9P9L9M7F9') !== false) {
        echo "❌ This still looks like dummy/placeholder data\n";
        echo "Please replace with a real Firebase service account key\n";
        exit(1);
    }
    
    echo "✅ JSON structure looks valid\n";
    
    // Try to initialize Firebase
    $factory = (new Factory)->withServiceAccount($serviceAccountPath);
    $messaging = $factory->createMessaging();
    
    echo "✅ Firebase messaging service initialized successfully!\n";
    echo "✅ Your Firebase setup is now working correctly!\n";
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    if (strpos($e->getMessage(), 'OpenSSL') !== false) {
        echo "This is still an OpenSSL/private key validation error.\n";
        echo "Please make sure you're using a real Firebase service account key.\n";
    }
}