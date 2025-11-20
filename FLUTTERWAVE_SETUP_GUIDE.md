# 🚀 FLUTTERWAVE SETUP GUIDE - Step by Step

## URGENT: Follow These Steps to Make Your Subscription Work!

### Step 1: Get Your Flutterwave Keys 🔑

1. **Go to Flutterwave Dashboard**: https://dashboard.flutterwave.com/
2. **Login/Sign up** for a Flutterwave account
3. **Get your keys**:
   - Navigate to **Settings > API Keys**
   - Copy your **Public Key** (starts with `FLWPUBK_TEST-`)
   - Copy your **Secret Key** (starts with `FLWSECK_TEST-`)

### Step 2: Update Backend Environment (.env) 🔧

Open `backend/.env` and replace these values with your actual keys:

```env
# Replace these with YOUR actual Flutterwave keys
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-actual-public-key-here
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-actual-secret-key-here
FLUTTERWAVE_WEBHOOK_SECRET_HASH=your-webhook-secret-hash
FLUTTERWAVE_ENVIRONMENT=sandbox
```

### Step 3: Update Frontend Environment (.env) 🌐

Open the root `.env` file and update:

```env
API_BASE_URL="http://localhost:8000"
VITE_FLUTTERWAVE_PUBLIC_KEY="FLWPUBK_TEST-your-actual-public-key-here"
```

### Step 4: Set Up Webhook in Flutterwave Dashboard 🔗

1. **Go to Settings > Webhooks** in your Flutterwave dashboard
2. **Add new webhook URL**: `http://your-domain.com/api/flutterwave/webhook`
   - For local testing: `http://localhost:8000/api/flutterwave/webhook`
3. **Generate a webhook secret hash** and add it to your backend `.env`

### Step 5: Test the Integration 🧪

1. **Start your backend server**:

   ```bash
   cd backend
   php artisan serve
   ```

2. **Start your frontend**:

   ```bash
   npm run dev
   ```

3. **Test the flow**:
   - Go to Payment Screen
   - Select a package
   - Click "Pay" button
   - Flutterwave modal should open
   - Complete payment with test card

### Step 6: Test Cards for Sandbox 💳

Use these test cards in sandbox mode:

**Successful Payment:**

```
Card Number: 5531886652142950
CVV: 564
Expiry: 09/32
Pin: 3310
OTP: 12345
```

**Mastercard:**

```
Card Number: 5399838383838381
CVV: 470
Expiry: 10/31
Pin: 3310
OTP: 12345
```

### Step 7: Check Your Database 💾

Make sure your database has the `payments` table:

```sql
-- Check if payments table exists
SHOW TABLES LIKE 'payments';

-- If not, run the migration
php artisan migrate
```

### Step 8: Enable Logging for Debugging 📝

In `backend/config/logging.php`, make sure you can see logs:

```php
'channels' => [
    'single' => [
        'driver' => 'single',
        'path' => storage_path('logs/laravel.log'),
        'level' => 'debug',
    ],
],
```

Watch the logs while testing:

```bash
cd backend
tail -f storage/logs/laravel.log
```

## 🛠️ TROUBLESHOOTING

### Problem: "Payment initialization failed"

**Solution:**

- Check your Flutterwave secret key in backend `.env`
- Verify API keys are correct
- Check network connection

### Problem: "Webhook signature invalid"

**Solution:**

- Set correct webhook secret hash in `.env`
- Make sure webhook URL is accessible
- Check Flutterwave dashboard webhook settings

### Problem: "Subscription not working"

**Solution:**

- Complete a successful payment first
- Check `payments` table for records with status = 'paid'
- Verify subscription check API endpoint works

### Problem: Navigation to subscription screen fails

**Solution:**

- Make sure you have a route for `/subscription` or `/payment`
- Update the navigate path to match your actual route
- Check React Router setup

## 🔄 TESTING WORKFLOW

1. **Select Package** → Payment Screen loads packages ✅
2. **Click Pay** → Flutterwave modal opens ✅
3. **Complete Payment** → Webhook receives confirmation ✅
4. **Payment Updates** → Database shows paid status ✅
5. **Generate Token** → Subscription check passes ✅

## 🚨 IMPORTANT NOTES

- **Use SANDBOX mode** for testing (never use live keys in development)
- **Webhook URL** must be publicly accessible (use ngrok for local testing)
- **Database** must be running and accessible
- **Laravel server** must be running on port 8000

## 📱 Quick Test Script

Run this in your browser console on the payment page:

```javascript
// Test if Flutterwave script loads
console.log("FlutterwaveCheckout available:", typeof FlutterwaveCheckout);

// Test API connection
fetch("http://localhost:8000/api/payments/packages", {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
})
  .then((r) => r.json())
  .then(console.log);
```

## 🎯 SUCCESS INDICATORS

- ✅ Payment modal opens when clicking "Pay"
- ✅ Test payment completes successfully
- ✅ Database shows payment record with status = 'paid'
- ✅ Visitor token generation works after payment
- ✅ Subscription status API returns active subscription

**Need help? Check the Laravel logs and browser console for error messages!**
