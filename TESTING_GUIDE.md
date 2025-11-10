# Email Verification System - Quick Testing Guide

## ✅ Prerequisites

Before testing, make sure:
1. ✅ Laravel server is running: `php artisan serve`
2. ✅ React frontend is running: `npm run dev`
3. ✅ MySQL database is set up with `springfield_db`
4. ✅ SMTP credentials configured in `.env`
5. ✅ All tables created (users, email_verifications, etc.)

---

## 🧪 Test Case 1: Normal User Registration & Email Verification

### Steps:
1. Open frontend: `http://localhost:5173`
2. Click "Sign Up"
3. Fill in the form:
   ```
   First Name: John
   Last Name: Doe
   Email: test@example.com
   Phone: 1234567890
   House Number: A101
   Address: 123 Main Street
   Password: SecurePass@123
   Confirm Password: SecurePass@123
   ```
4. Click "Register"

### Expected Results:
- ✅ Receives success modal
- ✅ Redirected to `/email-verification` page
- ✅ Email address displayed on page
- ✅ Email received with OTP code

### Verify in Database:
```sql
-- Check user was created
SELECT id, full_name, email, role, email_verified_at FROM users WHERE email = 'test@example.com';

-- Check OTP was created
SELECT * FROM email_verifications WHERE email = 'test@example.com';
```

### Continue Verification:
5. Enter OTP code from email
6. Click "Verify Email"

### Expected Results:
- ✅ Success modal shown
- ✅ Redirected to role-specific dashboard
- ✅ Database shows `email_verified_at` is no longer NULL

```sql
-- Verify email is marked as verified
SELECT email_verified_at FROM users WHERE email = 'test@example.com';
-- Should show a timestamp, not NULL
```

---

## 🧪 Test Case 2: Super Admin Registration (First 3 Users)

### Prerequisites:
- Make sure `users` table is empty or has less than 3 users

### Steps:
1. Register first user (follows Test Case 1)
2. Register second user (follows Test Case 1)
3. Register third user (follows Test Case 1)

### Expected Results for Each:
- ✅ User is created with role: `"super"`
- ✅ Email auto-verified (bypasses email verification page)
- ✅ Redirected directly to `/admin-dashboard`
- ✅ No email verification needed

### Verify in Database:
```sql
SELECT id, full_name, email, role, email_verified_at FROM users LIMIT 3;
-- First 3 users should have role='super' and email_verified_at != NULL
```

---

## 🧪 Test Case 3: Resend OTP

### Setup:
1. Register a user (Test Case 1, step 1-4)
2. Don't verify email yet

### Steps:
1. On email verification page, click "Didn't receive code? Resend"
2. Should see countdown timer (60 seconds)
3. Wait for timer to reach 0
4. Click "Resend" again
5. Should receive new email with new OTP

### Expected Results:
- ✅ First click shows 60-second cooldown
- ✅ Cannot click before 60 seconds
- ✅ New OTP received via email
- ✅ Old OTP no longer works
- ✅ New OTP can verify email

### Verify in Database:
```sql
-- Check that only latest OTP exists (old ones deleted)
SELECT * FROM email_verifications 
WHERE email = 'test@example.com' 
AND verified_at IS NULL;
-- Should only show most recent OTP record
```

---

## 🧪 Test Case 4: Invalid OTP

### Setup:
1. Register user and reach email verification page
2. Note the real OTP from email

### Steps:
1. Enter wrong OTP code (e.g., "000000")
2. Click "Verify Email"

### Expected Results:
- ✅ Error message: "Invalid or expired OTP code"
- ✅ OTP fields remain focused
- ✅ Form does not submit

### Verify in Database:
```sql
-- Check attempts counter incremented
SELECT attempts FROM email_verifications 
WHERE email = 'test@example.com' 
AND verified_at IS NULL;
-- Should be 1 or higher
```

### Test Attempt Limit:
1. Try 5 more incorrect OTPs
2. On 6th attempt, should receive: "Too many verification attempts. Please request a new OTP."

```sql
-- OTP record should be deleted after 5 failed attempts
SELECT * FROM email_verifications 
WHERE email = 'test@example.com' 
AND verified_at IS NULL;
-- Should return empty after 5 failed attempts
```

---

## 🧪 Test Case 5: Expired OTP

### Setup:
1. Register user
2. Wait for OTP to expire (default 10 minutes)
   - Or manually update in database:
   ```sql
   UPDATE email_verifications 
   SET expires_at = DATE_SUB(NOW(), INTERVAL 1 MINUTE)
   WHERE email = 'test@example.com';
   ```

### Steps:
1. Try to verify with correct OTP code
2. Click "Verify Email"

### Expected Results:
- ✅ Error message: "Invalid or expired OTP code"
- ✅ Cannot verify with expired OTP

---

## 🧪 Test Case 6: Role-Based Dashboard Redirect

### Steps:
1. Register 4 different test users

### Expected Results:
- **User 1**: Role `super` → Redirected to `/admin-dashboard`
- **User 2**: Role `super` → Redirected to `/admin-dashboard`
- **User 3**: Role `super` → Redirected to `/admin-dashboard`
- **User 4**: Role `resident` → Redirected to `/resident-dashboard`

### Example Test Registrations:
```
User 1: resident (becomes super because first 3)
User 2: landlord (becomes super because first 3)
User 3: resident (becomes super because first 3)
User 4: landlord (stays landlord, redirects to /landlord-dashboard)
```

---

## 📊 Database Verification Queries

### Check All Users and Their Verification Status:
```sql
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.role,
    u.email_verified_at,
    CASE 
        WHEN u.email_verified_at IS NULL THEN 'Not Verified'
        ELSE 'Verified'
    END as verification_status,
    COUNT(ev.id) as pending_otps
FROM users u
LEFT JOIN email_verifications ev 
    ON u.id = ev.user_id 
    AND ev.verified_at IS NULL
    AND ev.expires_at > NOW()
GROUP BY u.id
ORDER BY u.created_at DESC;
```

### Check All Email Verifications:
```sql
SELECT 
    ev.id,
    ev.user_id,
    u.full_name,
    ev.email,
    ev.otp_code,
    ev.attempts,
    ev.expires_at,
    CASE 
        WHEN ev.verified_at IS NOT NULL THEN 'Verified'
        WHEN ev.expires_at < NOW() THEN 'Expired'
        ELSE 'Pending'
    END as status
FROM email_verifications ev
JOIN users u ON ev.user_id = u.id
ORDER BY ev.created_at DESC
LIMIT 10;
```

### Check Pending OTPs (Not Yet Verified, Not Expired):
```sql
SELECT 
    id,
    user_id,
    email,
    otp_code,
    attempts,
    expires_at
FROM email_verifications
WHERE verified_at IS NULL
AND expires_at > NOW()
ORDER BY created_at DESC;
```

---

## 🐛 Troubleshooting

### Issue: "OTP not sent"
**Check:**
1. SMTP credentials in `.env`
2. `email_verifications` table exists
3. Laravel logs: `storage/logs/laravel.log`

### Issue: "OTP doesn't verify"
**Check:**
1. OTP code is correct (copy from email)
2. OTP hasn't expired (< 10 minutes)
3. User exists in database
4. Email matches registered email

### Issue: "Wrong dashboard after verification"
**Check:**
1. User role is set correctly in database
2. `role` is passed in navigation state
3. Route mapping in `EmailVerificationOtp.jsx`

### Issue: "Email not receiving OTP"
**Check:**
1. Check spam/junk folder
2. Verify email address in form
3. Check SMTP logs: `storage/logs/laravel.log`
4. Try resending OTP
5. Check mailbox credentials in `.env`

---

## 📝 API Testing with Postman/cURL

### Test Registration:
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone_number": "1234567890",
    "house_number": "A101",
    "address": "123 Main St",
    "password": "SecurePass@123",
    "password_confirmation": "SecurePass@123"
  }'
```

### Test Email Verification:
```bash
curl -X POST http://localhost:8000/api/email-verification/verify \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 10,
    "email": "john@example.com",
    "otp_code": "123456"
  }'
```

### Test Resend OTP:
```bash
curl -X POST http://localhost:8000/api/email-verification/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 10,
    "email": "john@example.com"
  }'
```

---

## ✅ Final Verification Checklist

Before going to production, verify:
- [ ] Email verification OTPs are sent and stored in database
- [ ] OTP can verify email and update `email_verified_at`
- [ ] Users are redirected to correct role-based dashboard
- [ ] Super admin users (first 3) skip email verification
- [ ] Resend OTP works with rate limiting
- [ ] Failed attempts are tracked and limited
- [ ] OTPs expire after 10 minutes
- [ ] Email templates are professional and clear
- [ ] All error messages are user-friendly
- [ ] Database records are properly created
- [ ] SMTP/Email sending is working

---

## 🚀 You're Ready!

When all tests pass, your email verification system is fully functional!

