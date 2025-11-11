# 🧪 Token Generation System - Testing Checklist

## Pre-Testing Requirements

- [ ] Backend is running on http://localhost:8000
- [ ] Frontend is running on http://localhost:5173
- [ ] Database has at least 1 super admin user
- [ ] You're logged in as super admin
- [ ] Check browser console is open (F12)

---

## Quick Start Test (5 minutes)

### Step 1: Generate OTP (Super Admin Dashboard)

```
1. Login with super admin credentials
   Email: admin@springfieldestate.com
   Password: (your password)

2. Go to: http://localhost:5173/super-admin/dashboard

3. Look for "Generate Token" section
   (Usually on the page or in a modal button)

4. Click "Generate" button

Expected: 
✅ Modal appears with OTP code (e.g., "123456")
✅ Shows expiry time
✅ Has "Copy" button
✅ Success message shown

Copy the OTP code!
```

### Step 2: Register Landlord with OTP

```
1. Open new browser tab or private window

2. Go to: http://localhost:5173/signup-otp

3. Enter the OTP code you just copied
   (e.g., "123456")

4. Click "Verify" button

Expected:
✅ Redirects to /signup
✅ Form appears
✅ House fields are HIDDEN (important!)
✅ Only name, email, phone, password fields visible

5. Fill the form:
   First Name: John
   Last Name: Landlord
   Email: john.landlord@example.com
   Phone: 08012345678
   Password: SecurePass123!
   Confirm Password: SecurePass123!

6. Click "Register"

Expected:
✅ Success modal appears
✅ Message: "Registration Successful!"
✅ "Please verify your email..."
```

### Step 3: Verify Email

```
Expected behavior:
✅ Redirects to /email-verification
✅ Shows OTP input field
✅ You should receive email verification OTP
   (Check email or check backend logs)

For testing:
- Check your email spam folder
- Or check Laravel logs for OTP
- Default test OTP might be in database
```

### Step 4: Login as New Landlord

```
1. Go to: http://localhost:5173/login

2. Enter:
   Email: john.landlord@example.com
   Password: SecurePass123!

3. Click "Sign In"

Expected:
✅ Login successful
✅ Message: "Redirecting to your dashboard..."
✅ Redirects to /admin/dashboard
✅ Shows admin dashboard (not resident dashboard)
✅ See admin navigation at bottom
```

---

## Detailed Test Cases

### Test Case 1: OTP Generation

**What to test:** Can Super Admin generate OTP?

**Steps:**
1. Login as super admin
2. Navigate to Super Admin Dashboard
3. Find "Generate Token" button
4. Click button

**Check:**
- [ ] Modal appears
- [ ] OTP is 6 digits (e.g., 123456)
- [ ] Shows "Expires at" time
- [ ] "Copy to Clipboard" button works
- [ ] Success toast/message shown
- [ ] OTP is different each time (test twice)

**Expected Response in Console:**
```javascript
{
  "success": true,
  "otp": "123456",
  "expires_at": "2025-11-12 18:10:34",
  "message": "OTP generated successfully"
}
```

---

### Test Case 2: OTP Verification (Valid)

**What to test:** Can user verify valid OTP?

**Prerequisites:**
- Generated OTP: 123456
- OTP not yet expired
- OTP not yet used

**Steps:**
1. Go to http://localhost:5173/signup-otp
2. Enter OTP: 123456
3. Click "Verify"

**Check:**
- [ ] Page redirects to /signup
- [ ] URL changes to /signup
- [ ] Form appears
- [ ] House fields are HIDDEN

**Expected in Console:**
```javascript
// State passed to /signup
{
  otpCode: "123456",
  targetRole: "landlord"
}
```

---

### Test Case 3: OTP Verification (Invalid)

**What to test:** Does system reject invalid OTP?

**Steps:**
1. Go to http://localhost:5173/signup-otp
2. Enter OTP: 000000
3. Click "Verify"

**Check:**
- [ ] Error message appears
- [ ] Does NOT redirect
- [ ] Stays on /signup-otp page
- [ ] Can try again

**Expected Error:**
```
"Invalid or expired OTP code"
```

---

### Test Case 4: Registration Form (via OTP)

**What to test:** Can user register with OTP-provided information?

**Prerequisites:**
- Valid OTP verified
- On /signup page with otpCode in state

**Steps:**
1. Fill form:
   ```
   First Name: John
   Last Name: Doe
   Email: john.doe@test.com
   Phone: 08012345678
   Password: SecurePass123!
   Confirm: SecurePass123!
   ```

2. Click "Register"

**Check:**
- [ ] Form validates (no errors for valid data)
- [ ] Success modal appears
- [ ] Message says "Registration Successful!"
- [ ] Mentions email verification needed
- [ ] Page redirects to /email-verification

**Expected Response:**
```javascript
{
  "success": true,
  "message": "Registration successful!",
  "data": {
    "user": {
      "id": 5,
      "full_name": "John Doe",
      "email": "john.doe@test.com",
      "role": "landlord",  // ← Important!
      "email_verified_at": null
    }
  }
}
```

---

### Test Case 5: House Fields Hidden (OTP Registration)

**What to test:** Are house fields hidden when registering via OTP?

**Prerequisites:**
- On /signup with otpCode in state

**Check:**
- [ ] "House Number" field NOT visible
- [ ] "Address" field NOT visible
- [ ] "Description" field NOT visible
- [ ] Only these fields visible:
  - First Name
  - Last Name
  - Email
  - Phone Number
  - Password
  - Confirm Password

---

### Test Case 6: Complete Landlord Flow

**What to test:** Full end-to-end landlord registration

**Duration:** ~5 minutes

**Steps:**

1. **Generate OTP**
   - Login as super admin
   - Click "Generate Token"
   - Copy OTP

2. **Enter OTP**
   - Go to /signup-otp
   - Paste OTP
   - Click "Verify"
   - Should redirect to /signup

3. **Register**
   - Fill form
   - Click "Register"
   - Should see success modal
   - Should redirect to /email-verification

4. **Verify Email**
   - On /email-verification page
   - Find verification OTP (check email or logs)
   - Enter OTP
   - Click "Verify"
   - Should verify successfully

5. **Login**
   - Go to /login
   - Enter email and password from registration
   - Click "Sign In"
   - Should redirect to /admin/dashboard

6. **Verify Access**
   - Should be on /admin/dashboard
   - Should see admin navigation
   - Can access /admin/visitors
   - Can access /admin/users

**Final Check:**
- [ ] User is logged in
- [ ] URL is /admin/dashboard
- [ ] Navigation shows admin options
- [ ] User role is "landlord"

---

### Test Case 7: Email Not Verified

**What to test:** Can landlord access dashboard without email verification?

**Steps:**
1. Complete registration (up to step 3)
2. Do NOT verify email
3. Try to login immediately
4. On /email-verification, click "Go Back" or refresh page
5. Try to access /admin/dashboard directly

**Check:**
- [ ] Cannot access /admin/dashboard
- [ ] Redirects to /email-verification
- [ ] Can only proceed after email verification

---

### Test Case 8: Duplicate Email

**What to test:** Does system reject duplicate email?

**Steps:**
1. Register first landlord with email: test@example.com
2. Try to register second landlord with same email
3. Click "Register"

**Check:**
- [ ] Error message appears
- [ ] Shows: "Email has already been taken"
- [ ] Registration fails
- [ ] No user created

---

### Test Case 9: Invalid Password

**What to test:** Does system validate password strength?

**Steps:**
1. On /signup with valid OTP
2. Fill form with:
   - Password: weak123
   - Confirm: weak123
3. Click "Register"

**Check:**
- [ ] Error message appears
- [ ] Shows password requirements not met
- [ ] Lists missing requirements:
  - [ ] At least 8 characters
  - [ ] One uppercase letter
  - [ ] One lowercase letter
  - [ ] One number
  - [ ] One special character

---

### Test Case 10: Already Used OTP

**What to test:** Can OTP be used twice?

**Prerequisites:**
- OTP that was already used in previous registration

**Steps:**
1. Go to /signup-otp
2. Enter the already-used OTP
3. Click "Verify"

**Check:**
- [ ] Error message appears
- [ ] Shows: "This OTP has already been used" or "Invalid or expired OTP code"
- [ ] Does NOT redirect
- [ ] Cannot complete registration

---

### Test Case 11: Expired OTP

**What to test:** Does system reject expired OTP?

**Prerequisites:**
- OTP that is expired (more than 24 hours old)

**Steps:**
1. Go to /signup-otp
2. Enter the expired OTP
3. Click "Verify"

**Check:**
- [ ] Error message appears
- [ ] Shows: "Invalid or expired OTP code"
- [ ] Does NOT redirect

---

### Test Case 12: Direct Access /signup with OTP

**What to test:** Can user directly access /signup with fake OTP in URL?

**Steps:**
1. Go to /signup directly (no OTP verification)
2. House fields should be VISIBLE (direct registration)
3. Try to register without OTP

**Check:**
- [ ] House Number field is VISIBLE
- [ ] Address field is VISIBLE
- [ ] Can register as resident (default)
- [ ] User role is "resident" (not landlord)

---

## Database Verification

### Check Generated OTP in Database

```sql
-- Run in MySQL
SELECT * FROM registration_otps 
WHERE created_at >= NOW() - INTERVAL 1 HOUR 
ORDER BY created_at DESC 
LIMIT 1;
```

**Should show:**
- otp_code: 6 digits (e.g., 123456)
- generated_by: super admin ID
- target_role: 'landlord'
- expires_at: Current time + 24 hours
- used_at: NULL (before use) or timestamp (after use)
- is_active: 1

---

### Check New Landlord User

```sql
-- Run in MySQL
SELECT id, full_name, email, phone, role, email_verified_at, house_id 
FROM users 
WHERE role = 'landlord' 
ORDER BY id DESC 
LIMIT 5;
```

**Should show:**
- role: 'landlord'
- email_verified_at: NULL (before verification) or timestamp (after)
- house_id: NULL (landlords from OTP don't get house)

---

## Network Requests to Verify

### 1. Generate OTP Request

**Check in Browser Network Tab (F12):**

```
Request:
POST http://localhost:8000/api/admin/generate-landlord-otp
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Response:
{
  "success": true,
  "otp": "123456",
  "expires_at": "2025-11-12 18:10:34"
}
```

---

### 2. Verify OTP Request

**Check in Browser Network Tab:**

```
Request:
POST http://localhost:8000/api/verify-registration-otp
Body:
{
  "otp_code": "123456"
}

Response:
{
  "success": true,
  "otp": {
    "id": 1,
    "otp_code": "123456",
    "target_role": "landlord"
  }
}
```

---

### 3. Registration Request

**Check in Browser Network Tab:**

```
Request:
POST http://localhost:8000/api/register
Body:
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone_number": "08012345678",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "otp_code": "123456",
  "target_role": "landlord"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "role": "landlord"
    }
  }
}
```

---

## Browser Console Checks

### Successful Flow Should Show:
```javascript
// 1. OTP verification
console.log("OTP verified:", {otpCode, targetRole})

// 2. Registration submission
console.log("Registering with:", requestBody)

// 3. Success response
console.log("Registration successful:", result)

// 4. Redirect
console.log("Redirecting to:", "/email-verification")
```

### Error Flow Should Show:
```javascript
// Invalid OTP
console.error("OTP verification failed:", error)

// Registration error
console.error("Registration error response:", result)
console.error("Error details:", result.errors)
```

---

## Success Criteria

### ✅ All Criteria Met = Ready for Production

- [ ] OTP generates successfully
- [ ] OTP can be copied
- [ ] OTP verifies correctly
- [ ] Invalid OTP rejected
- [ ] Used OTP rejected
- [ ] Expired OTP rejected
- [ ] House fields hidden for OTP registration
- [ ] User created with role='landlord'
- [ ] Email verification required
- [ ] Can login after verification
- [ ] Redirects to /admin/dashboard
- [ ] Admin navigation visible
- [ ] Can access admin routes
- [ ] Passwords validated
- [ ] Emails must be unique
- [ ] Database records correct

---

## Troubleshooting During Testing

### Issue: "Generate" button doesn't work

```
Check:
1. Are you logged in as super admin?
2. Check browser console (F12) for errors
3. Check Network tab for API response
4. Verify backend URL is correct
5. Check backend is running: php artisan serve
```

---

### Issue: OTP not displaying

```
Check:
1. Network tab - did API return success?
2. Check response has "otp" field
3. Check modal component renders
4. Check theme/styling isn't hiding it
5. Try in different browser
```

---

### Issue: User created but with role='resident'

```
Check:
1. Was otp_code passed to registration?
2. Was target_role passed?
3. Check Network tab POST body
4. Verify OTP target_role='landlord' in database
5. Check backend validation logic
```

---

### Issue: House fields still showing

```
Check:
1. Is otpCode in SignUpOtpScreen state?
2. Is state being passed to Signup?
3. Check useLocation hook in Signup.jsx
4. Verify conditional rendering logic
5. Clear browser cache
```

---

## Test Report Template

```
Date: [Date]
Tester: [Name]
Environment: Development/Staging/Production
Browser: [Chrome/Firefox/Safari]

Test Case: [Name]
Status: PASS / FAIL
Notes: [Any observations]

Overall Result: 
✅ All tests passed - Ready for production
⚠️ Some issues - Needs fixes
❌ Major issues - Do not deploy
```

---

## Next Steps After Testing

If all tests pass ✅:
1. Deploy to staging
2. Run same tests on staging
3. Deploy to production
4. Monitor for errors
5. Get user feedback

If tests fail ❌:
1. Note failing test case
2. Check troubleshooting section
3. Review code changes
4. Fix issues
5. Re-run tests

---

**Start Testing Now! 🚀**

Use the Quick Start Test above to verify the complete flow in ~5 minutes.

