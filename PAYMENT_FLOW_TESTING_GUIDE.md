# LANDLORD PAYMENT FLOW - FIXES & TESTING GUIDE

## Summary of Fixes Applied

### 1. **Payment Model Timestamps Fixed**
- **Issue**: The `Payment` model had `public $timestamps = false;` which prevented Laravel from managing `created_at` and `updated_at` timestamps properly.
- **Fix**: Removed the `public $timestamps = false;` line and added `updated_at` to the casts array.
- **File**: `backend/app/Models/Payment.php`

### 2. **Database Migration Added**
- **Issue**: The `payments` table was missing the `updated_at` column.
- **Fix**: Created and ran migration `2025_11_21_081625_add_updated_at_to_payments_table.php` to add the column.
- **Result**: Payments table now has both `created_at` and `updated_at` timestamps.

### 3. **Payment Verification Logic Already Working**
- The `PaymentController::verifyPayment()` method already has comprehensive logic for:
  - ✅ Test payments (tx_ref starting with 'SF_') always succeed
  - ✅ Updates payment status to 'paid'
  - ✅ Creates subscription record with correct expiry dates
  - ✅ Updates user's `payment_count` field
  - ✅ Updates user's `is_payment_up_to_date` field
  - ✅ Returns success response with all details

### 4. **Test Results**
- ✅ Backend simulation test **PASSED**
- ✅ Payment record created with status 'pending' → updated to 'paid'
- ✅ Subscription record created with status 'active'
- ✅ User payment_count updated from 0 → 1
- ✅ Database tables properly synchronized

---

## Current Configuration

### Landlord Payment Plans
**Landlord with Tenants:**
- Monthly: ₦7,000 (Plan ID: 227503)
- 6 Months: ₦42,000 (Plan ID: 227507)
- Yearly: ₦84,000 (Plan ID: 227508)

**Landlord Living Alone:**
- Monthly: ₦10,000 (Plan ID: 227505)
- 6 Months: ₦60,000 (Plan ID: TBD)
- Yearly: ₦120,000 (Plan ID: TBD)

### Test Mode Details
- **Flutterwave Public Key**: `FLWPUBK_TEST-f6c763bbc266a3f3715e63840945eeb6-X`
- **Test Card**: 4187427415564246
- **Any future expiry date** (e.g., 12/26)
- **Any CVV** (e.g., 123)
- **OTP**: 12345 (if prompted)

---

## Manual Testing Instructions

### Prerequisites
✅ Backend running on: `http://localhost:8000`
✅ Frontend running on: `http://localhost:5173`
✅ Database cleaned and ready

### Test User Credentials
- **Email**: yungtee5333@gmail.com
- **Password**: Jackson5$
- **Role**: Landlord
- **Current Payment Count**: 0

### Step-by-Step Testing Process

#### Step 1: Login
1. Open browser to `http://localhost:5173`
2. Click "Login" or navigate to login page
3. Enter credentials:
   - Email: `yungtee5333@gmail.com`
   - Password: `Jackson5$`
4. Click "Login"
5. **Verify**: You should be logged in and see the landlord dashboard

#### Step 2: Navigate to Payment Page
1. Look for "Payment", "Subscription", or "Pricing" in the navigation menu
2. Click to access the payment/subscription screen
3. **Verify**: You should see payment plans displayed

#### Step 3: Select Payment Plan
1. Ensure "Landlord with Tenants" toggle is selected (should be default)
2. You should see three plan cards:
   - Monthly: ₦7,000
   - 6 Months: ₦42,000
   - Yearly: ₦84,000
3. Click the "Pay" button on the **Monthly Plan (₦7,000)**

#### Step 4: Complete Flutterwave Payment
1. **Verify**: Flutterwave modal should open
2. **Important**: Watch the browser console (F12 → Console tab) for detailed logs
3. Fill in payment details:
   - **Card Number**: `4187427415564246`
   - **Expiry**: Any future date (e.g., `12/26`)
   - **CVV**: Any 3 digits (e.g., `123`)
   - **OTP**: `12345` (if prompted)
4. Click "Pay" or "Complete Payment"

#### Step 5: Watch for Success
1. **Expected Logs in Console**:
   ```
   🚀 STARTING PAYMENT PROCESS
   🔄 Calling backend payment initialization...
   ✅ Backend initialization successful
   🚀 Opening Flutterwave modal
   🎉 FLUTTERWAVE PAYMENT CALLBACK TRIGGERED
   🔄 CALLING VERIFICATION (regardless of Flutterwave status)...
   📤 SENDING VERIFICATION REQUEST TO BACKEND...
   📥 Backend verification response received
   🎉 PAYMENT VERIFICATION SUCCESSFUL!
   ```

2. **Expected Alert Message**:
   ```
   🎉 Payment Successful & Verified!
   Transaction ID: [transaction_id]
   Reference: SF_[timestamp]_35_[hash]
   Amount: ₦7,000
   
   Your subscription has been activated!
   Payments Count: 1
   Months Added: 1
   ```

3. **Expected Behavior**:
   - Alert appears with success message
   - Page refreshes after 3 seconds
   - Payment status should update

#### Step 6: Verify Database Updates
1. After payment completes, open a new terminal
2. Run the verification script:
   ```powershell
   cd c:\xampp\htdocs\Spring-Field\backend
   php test_landlord_payment_flow.php
   ```

3. **Expected Output**:
   ```
   User Information:
   ID: 35
   Name: Temitope Rotimi
   Email: yungtee5333@gmail.com
   Role: landlord
   Payment Count: 1  ← Should be 1 (was 0)
   Is Up to Date: Yes

   Recent Payments:
     Payment ID: [auto]
     Amount: ₦7000.00
     Period: monthly
     Status: paid  ← Must be 'paid', NOT 'pending'
     Paid At: [current timestamp]
     Created At: [current timestamp]

   Recent Subscriptions:
     Subscription ID: [auto]
     Package: landlord_with_tenants
     Period: monthly
     Amount: ₦7000.00
     Status: active  ← Must be 'active'
     Starts: [current timestamp]
     Expires: [1 month from now]
   ```

---

## Success Criteria

The payment flow is working correctly if ALL of these are true:

### ✅ Payment Record
- [ ] Status = **'paid'** (NOT 'pending')
- [ ] Amount = **7000.00**
- [ ] Period = **'monthly'**
- [ ] `paid_at` has a valid timestamp
- [ ] `flutterwave_txn_id` is populated
- [ ] `flutterwave_plan_id` = '227503'

### ✅ Subscription Record
- [ ] Status = **'active'**
- [ ] Package = **'landlord_with_tenants'**
- [ ] Period = **'monthly'**
- [ ] Amount = **7000.00**
- [ ] `expires_at` is 1 month from `starts_at`

### ✅ User Record
- [ ] `payment_count` increased by 1
- [ ] `is_payment_up_to_date` = 1 (true)
- [ ] `last_payment_check` has current timestamp

---

## Troubleshooting

### If Payment Shows as "Pending"

**Console Logs to Check:**
```javascript
// Should see these logs:
✅ Backend initialization successful
✅ Flutterwave modal opened
✅ Payment callback triggered
❌ Verification response - CHECK THIS

// If verification fails, check:
- Auth token present in verification request?
- User ID present in request?
- TX Ref matches between init and verify?
```

**Backend Logs:**
```bash
cd c:\xampp\htdocs\Spring-Field\backend\storage\logs
cat laravel.log | Select-String "PAYMENT|VERIFICATION" | Select-Object -Last 50
```

Look for:
- `🔥 === FRONTEND PAYMENT VERIFICATION REQUEST RECEIVED ===`
- `✅ User authenticated for payment verification`
- `🎉 LANDLORD TEST PAYMENT SUCCESSFUL - DATABASE UPDATED`

### If Flutterwave Modal Doesn't Open

1. **Check Browser Console** for errors
2. **Verify Script Loaded**:
   ```javascript
   console.log(window.FlutterwaveCheckout); // Should NOT be undefined
   ```
3. **Check Network Tab** (F12 → Network):
   - Look for call to `/api/payments/initialize`
   - Should return status 200
   - Should have `tx_ref` in response

### If Database Not Updating

1. **Check Backend is Running**:
   ```powershell
   Get-NetTCPConnection | Where-Object {$_.LocalPort -eq 8000}
   ```

2. **Check API Endpoint**:
   ```powershell
   cd c:\xampp\htdocs\Spring-Field\backend
   php artisan route:list --path=api/payments/verify
   ```

3. **Test API Directly**:
   ```bash
   # Get auth token from browser (F12 → Application → Local Storage)
   # Then test:
   curl -X GET "http://localhost:8000/api/payments/verify/SF_TEST_123" \
     -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
     -H "Accept: application/json"
   ```

---

## Cleanup Script (Optional)

If you need to reset and test again:

```powershell
cd c:\xampp\htdocs\Spring-Field\backend
php -r "
require __DIR__.'/vendor/autoload.php';
\$app = require_once __DIR__.'/bootstrap/app.php';
\$kernel = \$app->make(Illuminate\Contracts\Console\Kernel::class);
\$kernel->bootstrap();
DB::table('subscriptions')->where('user_id', 35)->delete();
DB::table('payments')->where('user_id', 35)->delete();
DB::table('users')->where('id', 35)->update(['payment_count' => 0]);
echo 'Test data cleaned for user ID 35\n';
"
```

---

## Files Modified

1. `backend/app/Models/Payment.php` - Enabled timestamps
2. `backend/database/migrations/2025_11_21_081625_add_updated_at_to_payments_table.php` - Added migration
3. `backend/test_landlord_payment_flow.php` - Created verification script
4. `backend/test_payment_api_simulation.php` - Created simulation test

---

## Next Steps After Successful Test

Once you confirm the payment flow works correctly:

1. **Test Other Plans**:
   - 6 Months Plan (₦42,000)
   - Yearly Plan (₦84,000)

2. **Test Landlord Living Alone**:
   - Switch toggle to "Living Alone"
   - Test Monthly Plan (₦10,000)

3. **Remove Debug Section** (if exists in PaymentScreen.jsx):
   - Search for "Debug Info"
   - Remove the debug info card from production

4. **Production Checklist**:
   - [ ] Replace test Flutterwave key with live key
   - [ ] Update plan IDs to live plan IDs
   - [ ] Remove console.log statements (or use proper logging)
   - [ ] Add error tracking (e.g., Sentry)
   - [ ] Set up webhook for redundancy

---

## Support

If issues persist after following this guide:

1. Collect browser console logs
2. Collect Laravel logs (`storage/logs/laravel.log`)
3. Run the test verification script
4. Share all outputs for debugging

---

**Status**: ✅ Backend payment logic is verified and working correctly. Ready for manual frontend testing.
