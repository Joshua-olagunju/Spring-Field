# Complete Authentication Flow Diagram

## 1. LOGIN FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                      LOGIN SCREEN                                │
│  (src/screens/authenticationScreens/Login.jsx)                  │
│                                                                   │
│  ┌──────────────────────────────────────────┐                   │
│  │ Email: _______________________________   │                   │
│  │ Password: _______________________________│                   │
│  │ [Show/Hide]                              │                   │
│  │                                           │                   │
│  │ [Sign In Button]                         │                   │
│  │                                           │                   │
│  │ Don't have account? Create Account →     │                   │
│  └──────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ handleSubmit()
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    USER CONTEXT                                   │
│  (context/UserContext.jsx)                                       │
│                                                                   │
│  login(email, password) {                                        │
│    POST /api/login                                              │
│    Body: { email, password }                                    │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP POST
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│               BACKEND API ENDPOINT                                │
│  (backend/routes/api.php)                                        │
│                                                                   │
│  Route::post('/login', [AuthController::class, 'login'])        │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ POST /api/login
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              AUTH CONTROLLER                                      │
│  (backend/app/Http/Controllers/Api/AuthController.php)          │
│                                                                   │
│  public function login(Request $request) {                       │
│    1. Validate email & password fields                          │
│    2. Find user by email                                        │
│    3. Check password with Hash::check()                         │
│    4. Check user status_active = true                           │
│    5. Create API token with Sanctum                             │
│    6. Log the login action                                      │
│    7. Return user + token                                       │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Response JSON
                            ↓
        ┌───────────────────────────────────────┐
        │      RESPONSE (200 OK)                 │
        │  {                                     │
        │    success: true,                      │
        │    message: "Login successful",        │
        │    user: {                             │
        │      id: 11,                           │
        │      full_name: "...",                │
        │      email: "...",                    │
        │      role: "super",                   │
        │      email_verified_at: "...",        │
        │      status_active: true              │
        │    },                                  │
        │    token: "xxxxx..."                  │
        │  }                                     │
        └───────────────────────────────────────┘
                            │
                            │ Back to Login.jsx
                            ↓
        ┌────────────────────────────────┐
        │  if result.success {            │
        │    Show success modal           │
        │    Store token + user in state  │
        │    Store in localStorage        │
        │    Check role & email verified  │
        │    Determine redirect path      │
        │  }                              │
        └────────────────────────────────┘
                            │
                            ↓
        ┌────────────────────────────────┐
        │  REDIRECT DECISION LOGIC        │
        │                                 │
        │  if (!email_verified_at)        │
        │    → /email-verification       │
        │                                 │
        │  else if (role === "super")    │
        │    → /super-admin-dashboard    │
        │                                 │
        │  else if (role === "landlord") │
        │    → /landlord-dashboard       │
        │                                 │
        │  else if (role === "resident") │
        │    → /resident-dashboard       │
        │                                 │
        │  else if (role === "security") │
        │    → /security-dashboard       │
        │                                 │
        │  else → /dashboard             │
        └────────────────────────────────┘
                            │
                            ↓
        ┌────────────────────────────────┐
        │   NAVIGATE TO DASHBOARD        │
        │   (after 1.5 second delay)     │
        └────────────────────────────────┘
```

---

## 2. DATABASE LOOKUP FLOW

```
Login Form
    ↓
Extract: email + password
    ↓
USER TABLE LOOKUP
    ↓
SELECT * FROM users WHERE email = 'user@example.com'
    ↓
Found?
├─ NO  → Return 401 "Invalid credentials"
│
└─ YES
    ↓
    User exists
    ├─ status_active = false?
    │   └─ Return 403 "Account not active"
    │
    └─ status_active = true
        ↓
        Hash::check(password_input, user.password_hash)
        ├─ Password Match?
        │   ├─ NO  → Return 401 "Invalid credentials"
        │   │
        │   └─ YES
        │       ↓
        │       CREATE TOKEN
        │       $user->createToken('auth_token')
        │       ↓
        │       RETURN SUCCESS
        │       {
        │         user: { id, full_name, email, role, ... },
        │         token: "..."
        │       }
        │
        └─ On error → Return 500
```

---

## 3. STATE MANAGEMENT FLOW

```
┌──────────────────────────────────────┐
│         Login.jsx                    │
│  state = {                           │
│    formData: {                       │
│      email: "",                      │
│      password: ""                    │
│    },                                │
│    isLoading: false,                 │
│    showModal: false                  │
│  }                                   │
└──────────────────────────────────────┘
          │                │
          │ calls          │
          ↓                ↓
┌──────────────────────────────────────┐
│       UserContext                    │
│  state = {                           │
│    user: null,                       │
│    authToken: null,                  │
│    isAuthenticated: false,           │
│    isLoading: true                   │
│  }                                   │
└──────────────────────────────────────┘
          │
          │ Stores in
          ↓
┌──────────────────────────────────────┐
│      localStorage                    │
│  {                                   │
│    "authToken": "...",              │
│    "userData": "{...user data...}"  │
│  }                                   │
└──────────────────────────────────────┘
          │
          │ On next page load
          ↓
┌──────────────────────────────────────┐
│   checkAuthStatus() runs             │
│  - Retrieves token from localStorage │
│  - Verifies token via API            │
│  - Restores user state               │
│  - Sets isAuthenticated = true       │
└──────────────────────────────────────┘
```

---

## 4. SIGNUP → REGISTRATION → LOGIN FLOW

```
START: User clicks "Create Account" or "Sign Up"
  │
  ↓
┌─────────────────────────────────────┐
│ SignUpOtpScreen.jsx                 │
│                                     │
│ Check Super Admin Count:            │
│ GET /api/super-admin-count          │
│                                     │
│ if count < 3:                       │
│   └─ Skip OTP → Go to Signup        │
│                                     │
│ if count >= 3:                      │
│   └─ Show OTP Form                  │
└─────────────────────────────────────┘
  │
  ├─────────────────────────────┬──────────────────────────────┐
  │ < 3 super admins            │ >= 3 super admins            │
  ↓                             ↓                              │
Redirect to /signup         Show OTP Form                  │
  │                             │                              │
  │                             │ Enter OTP                    │
  │                             ↓                              │
  │                         Verify OTP                     │
  │                         POST /api/validate-otp         │
  │                             │                              │
  │                             ↓                              │
  │                         Redirect to /signup            │
  │                         + otp_code in state            │
  │                             │                              │
  └─────────────────────────────┴──────────────────────────────┘
                            │
                            ↓
                ┌──────────────────────────┐
                │ Signup Screen            │
                │ Fill registration form   │
                │ - First Name             │
                │ - Last Name              │
                │ - Email                  │
                │ - Phone                  │
                │ - Password               │
                │ - House info (optional)  │
                │ - OTP code (if >= 3)     │
                └──────────────────────────┘
                            │
                            │ handleRegisterSubmit()
                            ↓
                ┌──────────────────────────┐
                │ POST /api/register       │
                │ Body: {                  │
                │   email, password,       │
                │   full_name, phone,      │
                │   otp_code (if >= 3)     │
                │ }                        │
                └──────────────────────────┘
                            │
                            ↓
                ┌──────────────────────────┐
                │ AuthController.register()│
                │                          │
                │ 1. Validate inputs       │
                │ 2. If >= 3 users:        │
                │    - Check OTP exists    │
                │    - Get OTP target_role │
                │    - Assign role based   │
                │      on target_role      │
                │ 3. If < 3 users:         │
                │    - Auto super admin    │
                │ 4. Create user in DB     │
                │ 5. Send email OTP        │
                └──────────────────────────┘
                            │
                            ├─ Success ──→ Return { success: true, message: "..." }
                            │
                            └─ Error   ──→ Return { success: false, message: "..." }
                            │
                            ↓
                ┌──────────────────────────┐
                │ EmailVerificationScreen  │
                │ Verify email OTP         │
                │ POST /api/verify-email   │
                │                          │
                │ Mark email as verified   │
                └──────────────────────────┘
                            │
                            ↓
                ┌──────────────────────────┐
                │ SUCCESS PAGE             │
                │ Account created!         │
                │ Email verified!          │
                │                          │
                │ [Go to Login]            │
                └──────────────────────────┘
                            │
                            ↓
                ┌──────────────────────────┐
                │ LOGIN SCREEN             │
                │ Enter credentials        │
                │ and proceed to dashboard │
                │ based on role            │
                └──────────────────────────┘
```

---

## 5. ROLE-BASED DASHBOARD ROUTING

```
After Login:

User stored in UserContext:
{
  id: 11,
  full_name: "Temitayo Rotimi",
  email: "yungtee5333@gmail.com",
  role: "super",
  email_verified_at: "2025-11-10T21:30:34Z",
  status_active: true
}

        │
        ├─ Email not verified?
        │  └─ /email-verification
        │
        ├─ role === "super"
        │  └─ /super-admin-dashboard
        │     Features: Manage landlords, view system stats, generate OTPs
        │
        ├─ role === "landlord"
        │  └─ /landlord-dashboard
        │     Features: Manage residents, view houses, collect payments
        │
        ├─ role === "resident"
        │  └─ /resident-dashboard
        │     Features: Pay rent, view house info, request maintenance
        │
        ├─ role === "security"
        │  └─ /security-dashboard
        │     Features: Manage visitors, check tokens, log entries
        │
        └─ Default
           └─ /dashboard (general dashboard)
```

---

## 6. API ENDPOINTS SUMMARY

```
PUBLIC (No Authentication Required)
├─ POST   /api/login              → Login & get token
├─ POST   /api/register           → Register new user
├─ POST   /api/validate-otp       → Validate OTP code
├─ GET    /api/super-admin-count  → Check admin count
└─ POST   /api/email-verification/* → Email verification OTPs

PROTECTED (Requires Authentication)
├─ POST   /api/auth/logout        → Logout user
├─ GET    /api/auth/me            → Get current user
├─ GET    /api/user               → Get user profile
├─ POST   /api/otp/generate-landlord   → Generate landlord OTP
├─ POST   /api/otp/generate-resident   → Generate resident OTP
├─ GET    /api/otp/my-otps        → List user's OTPs
└─ POST   /api/otp/{id}/deactivate    → Deactivate OTP
```

---

## 7. ERROR HANDLING FLOW

```
Login Error Scenarios:

1. VALIDATION ERROR (422)
   ├─ Missing email field
   ├─ Invalid email format
   ├─ Missing password field
   └─ User sees: "Please provide both email and password"

2. INVALID CREDENTIALS (401)
   ├─ Email doesn't exist
   ├─ Password doesn't match
   └─ User sees: "Invalid email or password"

3. ACCOUNT INACTIVE (403)
   ├─ status_active = false in database
   └─ User sees: "Your account is not active. Contact administrator"

4. SERVER ERROR (500)
   ├─ Database connection error
   ├─ Token creation error
   ├─ Email sending error
   └─ User sees: "Something went wrong. Please try again later"

5. NETWORK ERROR (No response)
   ├─ Backend server down
   ├─ Network connectivity issue
   └─ User sees: "Network error. Please check your connection"

All errors show:
├─ Modal dialog with error icon
├─ Error title: "Login Failed"
├─ Error details: Specific error message
└─ [OK] button to dismiss modal
```

---

## 8. TECHNOLOGY STACK

```
FRONTEND
├─ React 18
├─ React Router v6
├─ Context API (for state management)
├─ Tailwind CSS (for styling)
├─ Iconify (for icons)
└─ date-fns (for date formatting)

BACKEND
├─ Laravel 9
├─ Laravel Sanctum (API authentication)
├─ MySQL 8
├─ bcrypt (password hashing)
└─ Eloquent ORM

COMMUNICATION
├─ HTTP REST API
├─ JSON request/response format
├─ Bearer token authentication
└─ CORS enabled for localhost:5173
```

---

## Notes

- Token is stored as `authToken` in localStorage
- User data is stored as `userData` (JSON string) in localStorage
- Tokens expire after certain period (configurable in Laravel)
- Each API request needs `Authorization: Bearer <token>` header for protected routes
- Email verification is required before accessing main dashboards
- Account must be active (status_active = true) to login
