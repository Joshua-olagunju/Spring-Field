# 🚀 Production Deployment Guide - Springfield Estate Payment System

## Overview
This guide outlines EXACTLY what to change to make your payment system production-ready. All test payment logic has been removed, and your system is now configured to only accept real payments through Flutterwave.

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. **Flutterwave Account Setup**
- [ ] Create a Flutterwave Live Account (if not already done)
- [ ] Complete business verification
- [ ] Get your LIVE credentials:
  - Live Public Key (starts with `FLWPUBK-`)
  - Live Secret Key (starts with `FLWSECK-`)
  - Live Webhook Secret Hash

### 2. **Create LIVE Payment Plans** (CRITICAL!)
You need to recreate ALL your subscription plans in Flutterwave's LIVE environment.

#### Regular User Plans (by house type):
| House Type | Monthly Plan | 6 Months Plan | Yearly Plan |
|------------|--------------|---------------|-------------|
| Room Self (₦1,500) | Create in Flutterwave | Create in Flutterwave | Create in Flutterwave |
| Room & Parlor (₦2,000) | Create in Flutterwave | Create in Flutterwave | Create in Flutterwave |
| 2 Bedroom (₦2,500) | Create in Flutterwave | Create in Flutterwave | Create in Flutterwave |
| 3 Bedroom (₦3,000) | Create in Flutterwave | Create in Flutterwave | Create in Flutterwave |
| Duplex (₦4,000) | Create in Flutterwave | Create in Flutterwave | Create in Flutterwave |

**Total: 15 plans**

#### Landlord Plans:
| Package Type | Monthly | 6 Months | Yearly |
|--------------|---------|----------|--------|
| Landlord with Tenants (₦7,000) | Create in Flutterwave | Create in Flutterwave | Create in Flutterwave |
| Landlord Alone (₦10,000) | Create in Flutterwave | Create in Flutterwave | Create in Flutterwave |

**Total: 6 plans**

**GRAND TOTAL: 21 payment plans to create**

---

## 🔧 CONFIGURATION CHANGES

### **Step 1: Update Backend .env** (`backend/.env`)

Replace these lines:
```env
# OLD (TEST MODE)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-f6c763bbc266a3f3715e63840945eeb6-X
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-4fa547f2a97b52e6a421ee48285c285c-X
FLUTTERWAVE_WEBHOOK_SECRET_HASH=FLWSECK_TEST95d40ce2c3db
FLUTTERWAVE_ENVIRONMENT=sandbox
```

With your LIVE credentials:
```env
# NEW (PRODUCTION MODE)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-your_live_public_key_here-X
FLUTTERWAVE_SECRET_KEY=FLWSECK-your_live_secret_key_here-X
FLUTTERWAVE_WEBHOOK_SECRET_HASH=your_live_webhook_hash_here
FLUTTERWAVE_ENVIRONMENT=live
```

### **Step 2: Update Frontend .env** (`.env`)

Replace:
```env
# OLD (TEST MODE)
VITE_FLUTTERWAVE_PUBLIC_KEY="FLWPUBK_TEST-f6c763bbc266a3f3715e63840945eeb6-X"
```

With:
```env
# NEW (PRODUCTION MODE)
VITE_FLUTTERWAVE_PUBLIC_KEY="FLWPUBK-your_live_public_key_here-X"
```

### **Step 3: Update Plan IDs in PaymentController.php**

**CRITICAL:** You must update ALL plan IDs with your new LIVE plan IDs.

**File:** `backend/app/Http/Controllers/Api/PaymentController.php`

**Location:** In the `getPackages()` method

#### For Landlords (around line 42-87):
```php
'landlord_with_tenants' => [
    'plans' => [
        [
            'period' => 'monthly',
            'amount' => 7000,
            'plan_id' => 'YOUR_LIVE_PLAN_ID_HERE' // Replace 227503
        ],
        [
            'period' => '6months',
            'amount' => 42000,
            'plan_id' => 'YOUR_LIVE_PLAN_ID_HERE' // Replace 227507
        ],
        [
            'period' => 'yearly',
            'amount' => 84000,
            'plan_id' => 'YOUR_LIVE_PLAN_ID_HERE' // Replace 227508
        ]
    ]
],
'landlord_alone' => [
    'plans' => [
        [
            'period' => 'monthly',
            'amount' => 10000,
            'plan_id' => 'YOUR_LIVE_PLAN_ID_HERE' // Replace 227504
        ],
        [
            'period' => '6months',
            'amount' => 60000,
            'plan_id' => 'YOUR_LIVE_PLAN_ID_HERE' // Replace 227509
        ],
        [
            'period' => 'yearly',
            'amount' => 120000,
            'plan_id' => 'YOUR_LIVE_PLAN_ID_HERE' // Replace 227510
        ]
    ]
]
```

#### For Regular Users (around line 91-142):
```php
$packageConfig = [
    'room_self' => [
        'price' => 1500,
        'monthly_plan_id' => 'YOUR_LIVE_PLAN_ID_HERE', // Replace 227498
        'six_months_plan_id' => 'YOUR_LIVE_PLAN_ID_HERE', // Replace 227512
        'yearly_plan_id' => 'YOUR_LIVE_PLAN_ID_HERE' // Replace 227513
    ],
    'room_and_parlor' => [
        'price' => 2000,
        'monthly_plan_id' => 'YOUR_LIVE_PLAN_ID_HERE', // Replace 227499
        'six_months_plan_id' => 'YOUR_LIVE_PLAN_ID_HERE', // Replace 227514
        'yearly_plan_id' => 'YOUR_LIVE_PLAN_ID_HERE' // Replace 227515
    ],
    '2_bedroom' => [
        'price' => 2500,
        'monthly_plan_id' => 'YOUR_LIVE_PLAN_ID_HERE', // Replace 227500
        'six_months_plan_id' => 'YOUR_LIVE_PLAN_ID_HERE', // Replace 227516
        'yearly_plan_id' => 'YOUR_LIVE_PLAN_ID_HERE' // Replace 227517
    ],
    '3_bedroom' => [
        'price' => 3000,
        'monthly_plan_id' => 'YOUR_LIVE_PLAN_ID_HERE', // Replace 227501
        'six_months_plan_id' => 'YOUR_LIVE_PLAN_ID_HERE', // Replace 227518
        'yearly_plan_id' => 'YOUR_LIVE_PLAN_ID_HERE' // Replace 227519
    ],
    'duplex' => [
        'price' => 4000,
        'monthly_plan_id' => 'YOUR_LIVE_PLAN_ID_HERE', // Replace 227502
        'six_months_plan_id' => 'YOUR_LIVE_PLAN_ID_HERE', // Replace 227520
        'yearly_plan_id' => 'YOUR_LIVE_PLAN_ID_HERE' // Replace 227521
    ]
];
```

#### Update Plan ID Validation (around line 430-440):
```php
// Determine landlord package type based on plan ID
$landlordWithTenantsPlans = ['PLAN_ID_1', 'PLAN_ID_2', 'PLAN_ID_3']; // Replace 227503, 227507, 227508
$landlordAlonePlans = ['PLAN_ID_4', 'PLAN_ID_5', 'PLAN_ID_6']; // Replace 227504, 227509, 227510
```

---

## 📋 DEPLOYMENT STEPS

### 1. **Before Going Live:**
```bash
# 1. Backup your database
mysqldump -u root springfield_db > backup_before_production.sql

# 2. Clear all test data (optional but recommended)
# Run this in MySQL:
DELETE FROM payments WHERE status = 'pending';
DELETE FROM subscriptions WHERE created_at < NOW();
```

### 2. **Update Configuration Files:**
- Update `backend/.env` with LIVE credentials
- Update `.env` (root) with LIVE public key
- Update all Plan IDs in `PaymentController.php`

### 3. **Deploy & Test:**
```bash
# 1. Clear Laravel cache
cd backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# 2. Rebuild frontend
cd ..
npm run build

# 3. Restart your server
# (Depends on your hosting setup)
```

### 4. **Verify Deployment:**
- [ ] Login to your application
- [ ] Navigate to payment screen
- [ ] Check that payment modal opens with Flutterwave
- [ ] Verify pricing is correct
- [ ] Make a small test payment with REAL card (₦1-100)
- [ ] Confirm payment reflects in database
- [ ] Check Flutterwave dashboard for transaction

---

## 🔒 SECURITY CHECKLIST

- [ ] **APP_ENV** set to `production` in `backend/.env`
- [ ] **APP_DEBUG** set to `false` in `backend/.env`
- [ ] **APP_KEY** is properly generated
- [ ] HTTPS enabled on your domain
- [ ] Webhook URL configured in Flutterwave dashboard:
  - URL: `https://yourdomain.com/api/flutterwave/webhook`
  - Secret Hash: Your live webhook hash

---

## 🎯 WHAT HAS BEEN CHANGED FOR PRODUCTION

### ✅ Removed:
1. **Test payment bypass logic** - No more automatic approvals
2. **Hardcoded test public key** in React component
3. **Test payment fallback** - All payments MUST go through Flutterwave

### ✅ Production Ready:
1. **Environment-based configuration** - Change .env, everything updates
2. **Real Flutterwave verification** - All payments verified with Flutterwave API
3. **Clean payment flow** - Initialize → Pay → Verify → Create Subscription
4. **Proper error handling** - Failed payments are marked as failed
5. **Webhook support** - Background payment verification

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues:

**1. "Payment verification failed"**
- Check that LIVE secret key is correct
- Verify plan IDs match Flutterwave dashboard
- Check Laravel logs: `storage/logs/laravel.log`

**2. "Invalid public key"**
- Ensure frontend .env has correct LIVE public key
- Rebuild frontend after changing .env
- Clear browser cache

**3. "Webhook not working"**
- Verify webhook URL in Flutterwave dashboard
- Check webhook secret hash matches .env
- Ensure your server accepts POST requests to webhook URL

### Logs to Check:
```bash
# Laravel logs
tail -f backend/storage/logs/laravel.log

# Check for payment errors
grep "Payment" backend/storage/logs/laravel.log | tail -20
```

---

## 🎉 FINAL CHECKLIST

Before announcing to users:

- [ ] All environment variables updated
- [ ] All 21 payment plans created in Flutterwave LIVE
- [ ] All plan IDs updated in code
- [ ] Test payment completed successfully
- [ ] Database updated correctly after test payment
- [ ] Webhook configured and tested
- [ ] SSL certificate active
- [ ] Debug mode disabled
- [ ] Backup created

---

## 📝 QUICK REFERENCE - Files to Update

1. **backend/.env** - 4 lines (keys + environment)
2. **.env** (root) - 1 line (public key)
3. **backend/app/Http/Controllers/Api/PaymentController.php** - 21 plan IDs

**That's it! Change these 26 values and you're production-ready.**

---

## 💡 REMINDER

**TEST EVERYTHING** with a small amount first (₦1-100) before processing real customer payments!

Good luck! 🚀
