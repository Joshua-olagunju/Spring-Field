# Payment Tracking System Documentation

## Overview

The Payment Tracking System provides month-by-month payment tracking for users based on their registration date. This ensures users stay current with their monthly subscription payments to access paid features like visitor token generation.

## How It Works

### Core Concept

- **Registration-Based Counting**: Payment tracking starts from each user's registration date
- **Monthly Requirements**: Users need to pay for every month since they registered
- **Payment Count Tracking**: The `payment_count` field tracks total months paid
- **Access Control**: Users can only access paid features if they're up-to-date

### Database Schema

New columns added to `users` table:

```sql
payment_count INT DEFAULT 0 -- Total months paid for
is_payment_up_to_date BOOLEAN DEFAULT TRUE -- Current payment status
last_payment_check TIMESTAMP NULL -- Last status check time
```

## User Payment Status Logic

### Required Payments Calculation

```php
required_payments = months_since_registration
```

**Example:**

- User registered: January 1st
- Current date: June 1st
- Months since registration: 5
- Required payments: 5

### Up-To-Date Check

```php
is_up_to_date = (payment_count >= required_payments)
```

**Scenarios:**

| Registration | Current Date | Months Since | Payment Count | Status            |
| ------------ | ------------ | ------------ | ------------- | ----------------- |
| Jan 2024     | June 2024    | 5            | 5             | ✅ Up to date     |
| Jan 2024     | June 2024    | 5            | 4             | ❌ 1 month behind |
| Jan 2024     | June 2024    | 5            | 6             | ✅ 1 month ahead  |

## API Endpoints

### Get Subscription Status

**Endpoint:** `GET /api/payments/subscription-status`

**Response:**

```json
{
  "success": true,
  "data": {
    "has_active_subscription": true,
    "subscription_type": "monthly_tracking",
    "payment_status": {
      "months_since_registration": 5,
      "required_payments": 5,
      "payment_count": 5,
      "is_up_to_date": true,
      "months_behind": 0,
      "months_ahead": 0,
      "can_access_paid_features": true,
      "registration_date": "2024-01-01",
      "last_payment_check": "2024-06-01T10:30:00Z"
    },
    "can_generate_tokens": true
  }
}
```

## Payment Processing Flow

### When User Makes Payment

1. **Payment Completed** (via Flutterwave webhook)
2. **Determine Package Duration** (1, 6, or 12 months)
3. **Update Payment Count**:
   ```php
   payment_count = payment_count + months_purchased
   ```
4. **Update Status**:
   ```php
   is_payment_up_to_date = (payment_count >= required_payments)
   ```

### Package Duration Mapping

```php
// In PaymentTrackingService::getPackageDurationInMonths()
$priceToMonths = [
    1000 => 1,   // ₦1000 = 1 month
    5000 => 6,   // ₦5000 = 6 months
    10000 => 12, // ₦10000 = 12 months
];
```

## Visitor Token Generation

### Access Control

Before generating tokens, system checks:

```php
// In PaymentTrackingService::checkTokenGenerationEligibility()
if (!$user->isPaymentUpToDate()) {
    return [
        'can_generate' => false,
        'message' => 'You are X month(s) behind on payments',
        'payment_status' => $paymentStatus
    ];
}
```

### Frontend Integration

The visitor token modal now:

1. **Checks subscription status** on open
2. **Blocks token generation** if user is behind
3. **Shows payment prompt** with navigation to subscription plans
4. **Updates based on user role** (landlord vs regular user paths)

## Monthly Checks & Automation

### Console Command

**Manual Check:**

```bash
php artisan payments:check-monthly
```

**Dry Run (no changes):**

```bash
php artisan payments:check-monthly --dry-run
```

**Check Specific User:**

```bash
php artisan payments:check-monthly --user=user@example.com
```

### Automated Schedule

The system automatically runs:

- **Monthly Check**: 1st of each month at 2:00 AM
- **Daily Check**: Every day at 3:00 AM (catches mid-month changes)

```php
// In app/Console/Kernel.php
$schedule->command('payments:check-monthly')
         ->monthlyOn(1, '02:00')
         ->withoutOverlapping();

$schedule->command('payments:check-monthly')
         ->daily()
         ->at('03:00')
         ->withoutOverlapping();
```

## User Model Methods

### Payment Status Methods

```php
// Calculate months since registration
$user->getMonthsSinceRegistration(); // Returns: int

// Get required payments
$user->getRequiredPayments(); // Returns: int

// Check if up to date
$user->isPaymentUpToDate(); // Returns: bool

// Get months behind/ahead
$user->getMonthsBehind(); // Returns: int
$user->getMonthsAhead(); // Returns: int

// Add payment months
$user->addPaymentMonths(6); // Adds 6 months

// Update payment status
$user->updatePaymentStatus();

// Check paid features access
$user->canAccessPaidFeatures(); // Returns: bool

// Get complete payment status
$user->getPaymentStatus(); // Returns: array
```

## Example Usage Scenarios

### Scenario 1: New User Registration

```php
// User registers on January 1st
$user = User::create([...]);

// Initialize payment tracking
$paymentTrackingService->initializeUserPaymentTracking($user);
// payment_count = 0, is_payment_up_to_date = true
```

### Scenario 2: User Makes First Payment (March 1st)

```php
// 2 months since registration, user buys 6-month plan
$monthsSince = 2; // Jan, Feb
$paymentCount = 0; // No previous payments
$monthsPurchased = 6; // 6-month plan

// After payment:
$paymentCount = 6; // 0 + 6
$isUpToDate = true; // 6 >= 2
$monthsAhead = 4; // 6 - 2
```

### Scenario 3: User Falls Behind (August 1st)

```php
// 7 months since registration
$monthsSince = 7; // Jan through July
$paymentCount = 6; // From previous 6-month payment
$isUpToDate = false; // 6 < 7
$monthsBehind = 1; // 7 - 6

// User cannot generate tokens until they pay
```

## Administrative Features

### Payment Statistics

```php
$stats = $paymentTrackingService->getPaymentStatistics();
/*
Returns:
[
    'total_users' => 150,
    'up_to_date_users' => 140,
    'behind_users' => 10,
    'up_to_date_percentage' => 93.33,
    'average_payment_count' => 4.2
]
*/
```

### Users Behind on Payments

```php
$behindUsers = $paymentTrackingService->getUsersBehindOnPayments();
// Returns Collection of users with is_payment_up_to_date = false
```

## Security & Data Integrity

### Protection Against Manipulation

- **Database constraints** prevent negative payment counts
- **Webhook signature validation** ensures legitimate payments
- **Transaction verification** with Flutterwave before updating counts
- **Audit logging** tracks all payment count changes

### Error Handling

- **Graceful degradation** if payment service is unavailable
- **Rollback protection** using database transactions
- **Comprehensive logging** for debugging and auditing

## Migration & Deployment

### Existing Users

For users who registered before this system:

```php
// Initialize all existing users with payment_count = 0
// They start "up to date" and begin monthly tracking from now
User::where('payment_count', null)->update([
    'payment_count' => 0,
    'is_payment_up_to_date' => true,
    'last_payment_check' => now()
]);
```

### Testing

```bash
# Test the command
php artisan payments:check-monthly --dry-run

# Test specific user
php artisan payments:check-monthly --user=test@example.com --dry-run

# Check current statistics
php artisan tinker
>>> $service = new App\Services\PaymentTrackingService();
>>> $service->getPaymentStatistics();
```

## Monitoring & Alerts

### Logs to Monitor

- Payment count updates
- Status changes (up-to-date ↔ behind)
- Monthly check results
- Payment processing errors

### Key Metrics

- Percentage of users up-to-date
- Average payment count
- Monthly revenue correlation
- Token generation block rate

This system ensures fair, transparent, and automated payment tracking while providing users clear visibility into their payment status and requirements.
