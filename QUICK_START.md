# 🚀 QUICK START - Login System Testing

## 5-Minute Quick Start

### Step 1: Start Backend (Terminal 1)
```bash
cd C:\xampp\htdocs\Spring-Field\Spring-Field\backend
php artisan serve
```
✅ Should show: "Laravel development server started at http://127.0.0.1:8000"

### Step 2: Start Frontend (Terminal 2)
```bash
cd C:\xampp\htdocs\Spring-Field\Spring-Field
npm run dev
```
✅ Should show: "VITE v... ready in ... ms"

### Step 3: Test Login (Browser)
1. Open: `http://localhost:5173/login`
2. Enter email: `yungtee5333@gmail.com`
3. Enter password: `(ask super admin for password)`
4. Click "Sign In"

### Expected Result
✅ Success modal appears
✅ Redirects to `/super-admin-dashboard`
✅ Token in localStorage
✅ User data in localStorage

---

## Verify Installation

### Check Backend Running
```bash
curl http://localhost:8000/api/super-admin-count
```
Should return:
```json
{ "success": true, "data": { "super_admin_count": 1, "requires_otp": true } }
```

### Check Frontend Running
Open browser: `http://localhost:5173`
Should show landing page or login

### Check Database
```bash
C:\xampp\mysql\bin\mysql.exe -u root springfield_db
SELECT COUNT(*) FROM users;
```
Should return at least 1 user

---

## Test Cases - Quick Version

### Test 1: Valid Login ✅
```
Email: yungtee5333@gmail.com
Password: (correct password)
Result: Login success → dashboard redirect
```

### Test 2: Invalid Email ❌
```
Email: nonexistent@example.com
Password: anypassword
Result: Error modal "Invalid credentials"
```

### Test 3: Invalid Password ❌
```
Email: yungtee5333@gmail.com
Password: wrongpassword
Result: Error modal "Invalid credentials"
```

### Test 4: Network Error
```
Turn off WiFi / unplug ethernet
Try to login
Result: Error modal "Network error"
```

---

## Browser DevTools Check

### After Successful Login
Press F12 → Application Tab

**LocalStorage**:
- `authToken`: Should have value (70+ chars)
- `userData`: Should have JSON object with id, email, role, etc.

**Console**:
- No red errors
- No warnings about missing imports

---

## Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| Cannot POST /api/login | Backend not running. Run: `php artisan serve` |
| Network error | Check localhost:8000 in browser |
| 500 error | Backend error. Check: `php artisan log:tail` |
| Blank page | Frontend not running. Run: `npm run dev` |
| Token not saved | Check CORS config in backend |
| Wrong redirect | Check role value in database (lowercase) |
| Email error | Check email format in database |
| Password error | Password must be 8+ chars with uppercase, lowercase, number, special char |

---

## Database Quick Queries

### Check User
```sql
SELECT id, full_name, email, role, status_active, email_verified_at 
FROM users 
WHERE email = 'yungtee5333@gmail.com';
```

### Create Test User
```sql
INSERT INTO users (full_name, email, phone, password_hash, role, status_active, email_verified_at, created_at, updated_at)
VALUES (
    'Test User',
    'test@example.com',
    '+1234567890',
    '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P6ROG2',  -- password: 'secret'
    'resident',
    1,
    NOW(),
    NOW(),
    NOW()
);
```

### Count Super Admins
```sql
SELECT COUNT(*) as super_admin_count FROM users WHERE role = 'super';
```

### Get All Users
```sql
SELECT id, full_name, email, role FROM users;
```

---

## API Endpoints Quick Reference

### Login (Public)
```
POST /api/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "Password123!"
}

Response 200 OK:
{
    "success": true,
    "message": "Login successful",
    "user": { id, full_name, email, role, email_verified_at, ... },
    "token": "xxxx..."
}
```

### Check Super Admin Count (Public)
```
GET /api/super-admin-count

Response 200 OK:
{
    "success": true,
    "data": {
        "super_admin_count": 1,
        "requires_otp": true
    }
}
```

### Me - Get Current User (Protected)
```
GET /api/me
Authorization: Bearer TOKEN

Response 200 OK:
{
    "success": true,
    "user": { ... }
}
```

### Logout (Protected)
```
POST /api/auth/logout
Authorization: Bearer TOKEN

Response 200 OK:
{
    "success": true,
    "message": "Logged out successfully"
}
```

---

## File Locations

| What | Path |
|------|------|
| Login Screen | `src/screens/authenticationScreens/Login.jsx` |
| Auth Controller | `backend/app/Http/Controllers/Api/AuthController.php` |
| User Model | `backend/app/Models/User.php` |
| API Routes | `backend/routes/api.php` |
| User Context | `context/UserContext.jsx` |
| Test Docs | `LOGIN_TEST_GUIDE.md` |
| Flow Diagrams | `AUTHENTICATION_FLOW.md` |

---

## Role Values

Use these exact values (lowercase):
- `super` → Super Admin
- `landlord` → Landlord/Admin  
- `resident` → Resident/Tenant
- `security` → Security Guard

---

## Email Verification Status

- **NULL**: Email not verified
- **ISO Timestamp**: Email verified on that date

Example:
- Not verified: `email_verified_at = NULL` → Redirects to `/email-verification`
- Verified: `email_verified_at = 2025-11-10 21:30:34` → Redirects to dashboard

---

## Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Login successful |
| 401 | Unauthorized | Invalid credentials |
| 403 | Forbidden | Account inactive |
| 422 | Validation Error | Invalid email format |
| 500 | Server Error | Database connection failed |

---

## Required Passwords

Passwords must be:
- ✅ At least 8 characters
- ✅ At least 1 uppercase letter (A-Z)
- ✅ At least 1 lowercase letter (a-z)
- ✅ At least 1 number (0-9)
- ✅ At least 1 special character (@$!%*?&)

Examples:
- ✅ `SecurePass123!`
- ✅ `MyPassword@2025`
- ✅ `Test#Pass99`
- ❌ `password` (too simple)
- ❌ `Pass123` (no special char)

---

## Debugging Checklist

If something doesn't work:

- [ ] Backend running on :8000?
- [ ] Frontend running on :5173?
- [ ] Database connected?
- [ ] User exists in DB?
- [ ] Email field filled correctly?
- [ ] Password correct?
- [ ] No error in browser console (F12)?
- [ ] No error in backend logs?
- [ ] Network tab showing 200 response?
- [ ] localStorage has authToken?

---

## Quick Test Commands

### Test Backend
```bash
# Check server running
curl http://localhost:8000/api/health

# Check super admin count
curl http://localhost:8000/api/super-admin-count

# Test login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### Test Database
```bash
# Connect to MySQL
mysql -u root springfield_db

# Check users
SELECT * FROM users;

# Check if specific user exists
SELECT * FROM users WHERE email = 'yungtee5333@gmail.com';
```

---

## Success Indicators ✅

After successful login:
- [ ] Modal shows "Login Successful"
- [ ] Auto-redirects after 1.5 seconds
- [ ] URL changes to `/super-admin-dashboard` (or appropriate dashboard)
- [ ] Page loads without errors
- [ ] localStorage has `authToken` and `userData`
- [ ] Browser console has no red errors

---

## Common Errors & Solutions

### Error: "Cannot POST /api/login"
**Cause**: Backend not running
**Solution**: 
```bash
cd backend
php artisan serve
```

### Error: "Invalid credentials"
**Cause**: Wrong email or password
**Solution**: 
- Check email exists in database
- Check password is correct (8+ chars, mixed case, number, special char)

### Error: "Your account is not active"
**Cause**: `status_active = 0` in database
**Solution**:
```sql
UPDATE users SET status_active = 1 WHERE email = 'your@email.com';
```

### Error: "Network error"
**Cause**: Cannot reach backend
**Solution**:
- Check backend server running
- Check firewall not blocking port 8000
- Check WiFi/internet connection

### Error: "token not saved"
**Cause**: localStorage disabled or CORS issue
**Solution**:
- Check browser localStorage is enabled
- Check CORS config in backend
- Try in different browser

---

## Performance Targets

| Operation | Target | What To Do If Slow |
|-----------|--------|-------------------|
| Login response | <500ms | Check server load, database queries |
| Page redirect | Instant | Check browser performance |
| Token creation | <100ms | Check server resources |
| Email verify | <1s | Check email service |

---

## Next Steps After Login Works

1. ✅ Test signup flow
2. ✅ Test email verification
3. ✅ Test logout
4. ✅ Test role-based dashboards
5. ✅ Test OTP generation
6. ✅ Test various user roles
7. ✅ Test edge cases and errors
8. ✅ Load testing

---

## Help & Support

- **Tests Not Passing?** → See LOGIN_TEST_GUIDE.md
- **Want to Understand Flow?** → See AUTHENTICATION_FLOW.md
- **Want to See Changes?** → See CHANGES_MADE.md
- **Overview Needed?** → See README_LOGIN.md
- **Full Details?** → See PROJECT_COMPLETE.md

---

**Ready to test? Start with Step 1 above! 🚀**
