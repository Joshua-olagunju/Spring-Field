# 🔐 Routes Security & Authentication Guide

## Complete Route Map with Security

### Public Routes (No Authentication Required)
These routes are accessible to everyone without login.

```
GET  /                          → AutoRedirect (redirects to dashboard/login)
GET  /login                     → Login page
GET  /signup-otp               → Sign Up OTP selection screen
GET  /signup                   → Sign Up form
GET  /email-verification       → Email verification OTP screen
GET  /forgot-password          → Forgot password request
GET  /reset-password-otp       → Reset password OTP verification
GET  /reset-password           → New password form
```

---

## Protected Routes (Authentication Required)

### ✅ Authentication Check
All protected routes perform these checks:
1. **Is user logged in?** → If NO, redirect to `/login`
2. **Is email verified?** → If NO, redirect to `/email-verification`
3. **Does user have the required role?** → If NO, redirect to appropriate dashboard

---

## Role-Based Dashboards

### 🏠 Resident/User Dashboard (role: "resident")
```
Route: /dashboard
Path: src/screens/UserDashboardScreens/DashboradScreen/DashboardScreen.jsx
Protected: YES (requiredRole="resident")
Navigation: BottomNavBar (3 items: Home, Visitors, etc.)
Available Routes:
  - /dashboard          → Main dashboard
  - /visitors           → View visitor history
  - /subscription       → Subscription (Coming Soon)
  - /profile            → Profile (Coming Soon)
```

**Redirect Rule:**
- If resident tries to access `/admin/*` → Redirects to `/dashboard`
- If resident tries to access `/super-admin/*` → Redirects to `/dashboard`

---

### 👨‍💼 Landlord/Admin Dashboard (role: "landlord")
```
Route: /admin/dashboard
Path: src/screens/AdminDashboardScreens/DashboardScreen/LandlordDashboard.jsx
Protected: YES (requiredRole="landlord")
Navigation: AdminBottomNav (manages properties and residents)
Available Routes:
  - /admin/dashboard    → Main admin dashboard
  - /admin/visitors     → View all visitors
  - /admin/users        → Manage resident users
```

**Redirect Rule:**
- If landlord tries to access `/dashboard` → Redirects to `/admin/dashboard`
- If landlord tries to access `/super-admin/*` → Redirects to `/admin/dashboard`

---

### 👑 Super Admin Dashboard (role: "super")
```
Route: /super-admin/dashboard
Path: src/screens/SuperAdminDashboardScreens/DashboardScreen/SuperAdminDashboard.jsx
Protected: YES (requiredRole="super")
Navigation: SuperAdminBottomNav (manages entire system)
Available Routes:
  - /super-admin/dashboard   → Main super admin dashboard
  - /super-admin/visitors    → View all system visitors
  - /super-admin/admins      → Manage landlords/admins
  - /super-admin/reports     → View system reports
```

**Redirect Rule:**
- If super admin tries to access `/dashboard` → Redirects to `/super-admin/dashboard`
- If super admin tries to access `/admin/*` → Redirects to `/super-admin/dashboard`

---

### 🔒 Security Guard Dashboard (role: "security")
```
Routes: /dashboard (same as resident)
Protected: YES
Navigation: BottomNavBar
Note: Security staff use resident dashboard routes but typically have limited permissions
```

---

## Login Flow (Step by Step)

### 1️⃣ User Submits Login Form
```
POST /api/login
{
  email: "user@example.com",
  password: "SecurePass123!"
}
```

### 2️⃣ Backend Validates & Responds
```
Response {
  success: true,
  token: "eyJhbGc...",
  user: {
    id: 1,
    email: "user@example.com",
    full_name: "John Doe",
    role: "resident",           // super, landlord, resident, or security
    email_verified_at: "2025-11-10T..." OR null,
    phone: "08012345678",
    ...
  }
}
```

### 3️⃣ Frontend Stores & Redirects
**Code Location:** `src/screens/authenticationScreens/Login.jsx`

```javascript
// Check email verification
if (!userData.email_verified_at) {
  redirectPath = "/email-verification";
}
// Route by role
else if (userData.role === "super") {
  redirectPath = "/super-admin/dashboard";
} else if (userData.role === "landlord") {
  redirectPath = "/admin/dashboard";
} else if (userData.role === "resident") {
  redirectPath = "/dashboard";
} else if (userData.role === "security") {
  redirectPath = "/dashboard";
}
```

### 4️⃣ User Arrives at Correct Dashboard
✅ Resident → `/dashboard`
✅ Landlord → `/admin/dashboard`
✅ Super Admin → `/super-admin/dashboard`
✅ Unverified → `/email-verification`

---

## Protected Route Component

**Location:** `components/GeneralComponents/ProtectedRoute.jsx`

### How It Works:
```javascript
<ProtectedRoute requiredRole="landlord">
  <LandlordDashboard />
</ProtectedRoute>
```

### Security Checks:

| Check | Action | Redirect |
|-------|--------|----------|
| Not authenticated | Show loading → Check token | `/login` |
| Token invalid | Clear auth | `/login` |
| Email not verified | Allow access | `/email-verification` |
| Role doesn't match | User has role | Appropriate dashboard |
| No required role | Allow if authenticated | Children component |

---

## Route Access Matrix

| Route | Anonymous | Resident | Landlord | Super Admin | Security |
|-------|-----------|----------|----------|-------------|----------|
| `/login` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/dashboard` | ❌ | ✅ | ❌ | ❌ | ✅ |
| `/admin/dashboard` | ❌ | ❌ | ✅ | ❌ | ❌ |
| `/admin/users` | ❌ | ❌ | ✅ | ❌ | ❌ |
| `/super-admin/dashboard` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `/super-admin/admins` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `/email-verification` | ❌ | ✅* | ✅* | ✅* | ✅* |

*Only if email_verified_at is null

---

## URL Manipulation Prevention

### ❌ What Happens If User Tries To:

**Scenario 1: Resident tries `/admin/dashboard`**
```
1. ProtectedRoute checks role
2. User has role="resident"
3. Required role="landlord"
4. REDIRECT → /dashboard ✅
```

**Scenario 2: Landlord tries `/super-admin/dashboard`**
```
1. ProtectedRoute checks role
2. User has role="landlord"
3. Required role="super"
4. REDIRECT → /admin/dashboard ✅
```

**Scenario 3: Unauthenticated user tries `/dashboard`**
```
1. ProtectedRoute checks isAuthenticated
2. isAuthenticated = false
3. REDIRECT → /login ✅
```

**Scenario 4: Logged-out user in URL bar types `/dashboard`**
```
1. App loads
2. ProtectedRoute checks localStorage token
3. Token invalid or missing
4. REDIRECT → /login ✅
```

---

## Security Features Implemented

### 🔐 Token Management
- ✅ JWT tokens stored in localStorage
- ✅ Token sent in Authorization header: `Bearer {token}`
- ✅ Token verified on each app load
- ✅ Invalid token triggers automatic logout

### 🔑 Authentication Checks
- ✅ All protected routes require authentication
- ✅ isLoading state prevents redirect flashes
- ✅ Automatic redirect on invalid token
- ✅ Session persistence across page refreshes

### 🛡️ Role-Based Access Control (RBAC)
- ✅ Routes specify `requiredRole` parameter
- ✅ User role checked before component renders
- ✅ Unauthorized access redirected appropriately
- ✅ Fallback redirects to safe landing pages

### 📧 Email Verification Enforcement
- ✅ Unverified emails redirected to `/email-verification`
- ✅ Verified status checked before dashboard access
- ✅ Forced email verification before full access

### 🚫 URL Hacking Prevention
- ✅ Cannot bypass role checks via URL
- ✅ Cannot access dashboards without token
- ✅ Cannot access dashboards with wrong role
- ✅ Cannot access dashboards without email verification

---

## Testing Checklist

### Test 1: Login as Resident
```
1. Go to /login
2. Enter resident credentials
3. Click "Sign In"
4. ✅ Should redirect to /dashboard
5. ✅ Top/Bottom nav should be user nav
```

### Test 2: Login as Landlord
```
1. Go to /login
2. Enter landlord credentials
3. Click "Sign In"
4. ✅ Should redirect to /admin/dashboard
5. ✅ Top/Bottom nav should be admin nav
```

### Test 3: Login as Super Admin
```
1. Go to /login
2. Enter super admin credentials
3. Click "Sign In"
4. ✅ Should redirect to /super-admin/dashboard
5. ✅ Top/Bottom nav should be super admin nav
```

### Test 4: URL Hacking - Resident to Admin
```
1. Login as resident
2. Navigate to /admin/dashboard
3. ✅ Should redirect to /dashboard
```

### Test 5: URL Hacking - Landlord to Super Admin
```
1. Login as landlord
2. Navigate to /super-admin/dashboard
3. ✅ Should redirect to /admin/dashboard
```

### Test 6: Unauthenticated Access
```
1. Clear localStorage
2. Go to /dashboard
3. ✅ Should redirect to /login
```

### Test 7: Unverified Email
```
1. Login with unverified email
2. ✅ Should redirect to /email-verification
3. ❌ Should NOT show dashboard
```

### Test 8: Token Expiry
```
1. Login normally
2. Modify token in localStorage (make invalid)
3. Refresh page
4. ✅ Should redirect to /login
```

---

## File References

**Core Authentication Files:**
- `context/UserContext.jsx` - User state & login/logout
- `context/useUser.js` - Hook to access user context
- `components/GeneralComponents/ProtectedRoute.jsx` - Route protection logic
- `src/screens/authenticationScreens/Login.jsx` - Login form & redirects

**Route Configuration:**
- `src/App.jsx` - Main route setup with role checks

**Navigation Components:**
- `components/UserComponents/BottomNavBar.jsx` - Resident navigation
- `components/AdminComponents/AdminBottomNav.jsx` - Landlord navigation
- `components/SuperAdminComponents/SuperAdminBottomNav.jsx` - Super Admin navigation

---

## API Endpoints Used

```
POST   /api/login              → Authenticate user
POST   /api/logout             → Log out user
POST   /api/verify-token       → Check token validity
GET    /api/user/profile       → Fetch user data
GET    /api/super-admin-count  → Count super admins
```

---

## Environment Variables

`.env` or configuration:
```
VITE_API_BASE_URL=http://localhost:8000
```

---

## Common Issues & Solutions

### ❌ Issue: Stuck on login screen
**Solution:** Check localStorage tokens, verify backend is running on port 8000

### ❌ Issue: Redirects to wrong dashboard
**Solution:** Check user.role value matches role check in ProtectedRoute

### ❌ Issue: Cannot access protected routes
**Solution:** Verify token in localStorage, check CORS configuration

### ❌ Issue: Email verification loop
**Solution:** Verify `email_verified_at` is populated after verification

---

## Summary

✅ All routes are now secured with authentication
✅ Role-based access control enforced
✅ Email verification required for dashboard access
✅ URL manipulation prevented
✅ Proper redirects for all scenarios
✅ Loading states prevent flash redirects
✅ Automatic session recovery on page refresh

**Status: 🟢 PRODUCTION READY**

