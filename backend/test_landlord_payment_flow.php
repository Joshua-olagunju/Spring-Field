<?php

/**
 * Test script to verify landlord payment flow
 * This simulates the complete payment process for a landlord
 */

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "springfield_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "=== LANDLORD PAYMENT FLOW TEST ===\n\n";

// Get user data
$email = 'yungtee5333@gmail.com';
$sql = "SELECT id, full_name, email, role, payment_count, is_payment_up_to_date FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    die("User not found!\n");
}

echo "User Information:\n";
echo "ID: {$user['id']}\n";
echo "Name: {$user['full_name']}\n";
echo "Email: {$user['email']}\n";
echo "Role: {$user['role']}\n";
echo "Payment Count: {$user['payment_count']}\n";
echo "Is Up to Date: " . ($user['is_payment_up_to_date'] ? 'Yes' : 'No') . "\n\n";

// Check existing payments
$sql = "SELECT id, amount, period_type, status, paid_at, created_at FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 5";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user['id']);
$stmt->execute();
$result = $stmt->get_result();

echo "Recent Payments:\n";
if ($result->num_rows == 0) {
    echo "No payments found.\n\n";
} else {
    while ($payment = $result->fetch_assoc()) {
        echo "  Payment ID: {$payment['id']}\n";
        echo "  Amount: ₦{$payment['amount']}\n";
        echo "  Period: {$payment['period_type']}\n";
        echo "  Status: {$payment['status']}\n";
        echo "  Paid At: " . ($payment['paid_at'] ?? 'N/A') . "\n";
        echo "  Created At: {$payment['created_at']}\n";
        echo "  ---\n";
    }
}

// Check subscriptions
$sql = "SELECT id, package_type, period, amount, starts_at, expires_at, status FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user['id']);
$stmt->execute();
$result = $stmt->get_result();

echo "\nRecent Subscriptions:\n";
if ($result->num_rows == 0) {
    echo "No subscriptions found.\n\n";
} else {
    while ($subscription = $result->fetch_assoc()) {
        echo "  Subscription ID: {$subscription['id']}\n";
        echo "  Package: {$subscription['package_type']}\n";
        echo "  Period: {$subscription['period']}\n";
        echo "  Amount: ₦{$subscription['amount']}\n";
        echo "  Status: {$subscription['status']}\n";
        echo "  Starts: {$subscription['starts_at']}\n";
        echo "  Expires: {$subscription['expires_at']}\n";
        echo "  ---\n";
    }
}

$conn->close();

echo "\n=== TEST COMPLETE ===\n";
echo "\nTo test payment flow:\n";
echo "1. Login at http://localhost:5173 with yungtee5333@gmail.com / Jackson5$\n";
echo "2. Navigate to Payment/Subscription page\n";
echo "3. Select 'Landlord with Tenants' and choose a plan (Monthly: ₦7,000)\n";
echo "4. Use test card: 4187427415564246 (any future expiry, any CVV)\n";
echo "5. After successful payment, run this script again to verify database updates\n";
