# Quick Test Guide - Login Flow

## Prerequisites
- Backend running: `php artisan serve` (port 8000)
- Frontend running: `npm run dev` (port 5173)
- Database: MySQL with springfield_db

## Test Case 1: Login with Super Admin Account

### Steps:
1. Navigate to: `http://localhost:5173/login`
2. Enter email: `yungtee5333@gmail.com`
3. Enter password: `(Use actual password from database)`
4. Click "Sign In"

### Expected Behavior:
- ✅ Login button shows "Signing In..." with spinner
- ✅ Success modal appears saying "Login Successful"
- ✅ Modal auto-closes after 2 seconds
- ✅ Redirects to `/super-admin-dashboard`
- ✅ User data and token stored in localStorage

### What to Check:
```javascript
// Open Browser DevTools Console (F12)
// Check localStorage:
localStorage.getItem('authToken')     // Should have token
localStorage.getItem('userData')      // Should have user object

// Check Network Tab:
// POST /api/login should return 200 with user + token
```

---

## Test Case 2: Login with Invalid Credentials

### Steps:
1. Navigate to: `http://localhost:5173/login`
2. Enter email: `nonexistent@example.com`
3. Enter password: `WrongPassword123!`
4. Click "Sign In"

### Expected Behavior:
- ✅ Loading spinner shows briefly
- ✅ Error modal appears: "Login Failed - Invalid credentials"
- ✅ User stays on login page
- ✅ Form is cleared (optional)

### What to Check:
```
Network Tab:
- POST /api/login returns 401 Unauthorized
- Response contains: { success: false, message: "Invalid credentials" }
```

---

## Test Case 3: Create New User & Login

### Part A: Signup as First User (< 3 super admins scenario)

1. Navigate to: `http://localhost:5173/signup-otp`
2. Since there's already 1 super admin, you'll see OTP screen
3. Get OTP code from super admin or generate one
4. Enter OTP and click "Verify OTP"
5. Should redirect to `/signup`
6. Fill registration form with:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Phone: +1234567890
   - Password: SecurePass123!
   - Confirm Password: SecurePass123!
7. Click "Create Account"
8. Should redirect to email verification screen

### Part B: Verify Email

1. Get OTP from database or email
2. Enter OTP on email verification screen
3. Click "Verify"
4. Should redirect to login

### Part C: Login with New Account

1. Navigate to: `http://localhost:5173/login`
2. Enter email: `john.doe@example.com`
3. Enter password: `SecurePass123!`
4. Click "Sign In"

### Expected Behavior:
- ✅ Login successful
- ✅ User is redirected to `/email-verification` (email needs verification)
- ℹ️ Note: If email was verified in Part B, should redirect to role dashboard instead

---

## Test Case 4: Email Not Verified Check

### Setup:
- Create a user manually in database with `email_verified_at = NULL`
- Or create new user and skip email verification

### Steps:
1. Login with that user's credentials
2. Click "Sign In"

### Expected Behavior:
- ✅ Login successful
- ✅ Modal shows "Login Successful"
- ✅ Redirects to `/email-verification` (not to dashboard)
- ✅ User must verify email before accessing dashboard

---

## Test Case 5: Inactive Account

### Setup:
```sql
UPDATE users SET status_active = 0 WHERE email = 'yungtee5333@gmail.com';
```

### Steps:
1. Try to login with that user
2. Enter password

### Expected Behavior:
- ✅ Error modal appears: "Your account is not active..."
- ✅ User cannot login

### Cleanup:
```sql
UPDATE users SET status_active = 1 WHERE email = 'yungtee5333@gmail.com';
```

---

## Database Queries for Testing

### Check Super Admin Count
```sql
SELECT COUNT(*) as super_admin_count FROM users WHERE role = 'super';
```

### Create Test User (if needed)
```sql
INSERT INTO users (
    full_name, email, phone, password_hash, 
    role, status_active, email_verified_at, created_at, updated_at
) VALUES (
    'Test User', 'test@example.com', '+9876543210',
    '$2y$10$...bcrypt_hash...', 'resident', 1,
    NOW(), NOW(), NOW()
);
```

### View All Users
```sql
SELECT id, full_name, email, role, status_active, email_verified_at 
FROM users 
ORDER BY created_at DESC;
```

### Reset Test Database
```sql
DELETE FROM email_verifications;
DELETE FROM registration_otps;
DELETE FROM users WHERE id >= 2;
```

---

## Common Issues & Solutions

### Issue: "Failed to resolve import 'date-fns'"
**Solution**: Run `npm install date-fns` in root frontend folder

### Issue: "Cannot POST /api/login"
**Solution**: 
- Check backend is running on port 8000
- Check API route exists in `routes/api.php`
- Check AuthController exists

### Issue: "Invalid token" or "Token expired"
**Solution**:
- Clear localStorage and try again
- Restart backend server
- Check if Sanctum middleware is working

### Issue: "CORS error on login"
**Solution**:
- Check `config/cors.php` includes `http://localhost:5173`
- Restart backend after changing CORS config

### Issue: "401 Unauthorized on login"
**Solution**:
- Check password matches in database (bcrypt verify)
- Verify user exists with exact email match (case-sensitive)
- Check status_active is true (1)

---

## API Response Examples

### Successful Login (200 OK)
```json
{
    "success": true,
    "message": "Login successful",
    "user": {
        "id": 11,
        "full_name": "Temitayo Rotimi",
        "email": "yungtee5333@gmail.com",
        "phone": "+1234567890",
        "role": "super",
        "status_active": true,
        "email_verified_at": "2025-11-10T21:30:34.000000Z",
        "house": null
    },
    "token": "2|ZA3nPxOe4vK7mK9L2xZ5qP8bR4tU9vW2xY3aB5cD7eF"
}
```

### Failed Login - Invalid Credentials (401)
```json
{
    "success": false,
    "message": "Invalid credentials"
}
```

### Failed Login - Account Inactive (403)
```json
{
    "success": false,
    "message": "Your account is not active. Please contact your landlord or administrator."
}
```

### Failed Login - Validation Error (422)
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": ["The email field is required."]
    }
}
```

---

## Performance Checks

### Check Login Speed
- Open DevTools → Network tab
- Login and check POST /api/login response time
- Should be < 500ms typically
- If > 1s, check database or server load

### Check Token Storage
- Open DevTools → Application tab → LocalStorage
- Should see: `authToken`, `userData`
- `authToken` should be long (70+ characters)
- `userData` should be valid JSON

### Check Redirect Logic
- Open DevTools → Network tab
- After login, check navigated URL changes to appropriate dashboard
- DevTools → Application → SessionStorage (if used)

---

## Debugging Tips

### Enable Console Logging
In `Login.jsx` and `UserContext.jsx`, check console for:
- Login request details
- Response from server
- Token storage
- Redirect URL

### Network Monitoring
```javascript
// DevTools Console - Check last request
fetch("http://localhost:8000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
        email: "yungtee5333@gmail.com", 
        password: "YOUR_PASSWORD" 
    })
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error(e))
```

### Database Connection Check
```bash
# From backend folder
php artisan tinker
>>> User::count()
>>> User::first()
```

---

## Sign-Off Checklist

- [ ] Login with valid credentials works
- [ ] Login with invalid credentials shows error
- [ ] Role-based redirect working (super → super-admin-dashboard)
- [ ] Email verification check working
- [ ] Token stored in localStorage
- [ ] User data stored in localStorage
- [ ] Logout clears localStorage
- [ ] Cannot access protected routes without token
- [ ] Token expires properly after 24 hours (if configured)
- [ ] Error messages are helpful and user-friendly
