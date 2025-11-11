# 📊 Token Generation System - Visual Diagrams & Quick Reference

## Quick Lookup Table

| What | Where | How |
|---|---|---|
| Generate OTP | Super Admin Dashboard | Click "Generate Token" button |
| Share OTP | Anywhere | Copy from modal, send to user |
| Enter OTP | http://localhost:5173/signup-otp | Paste OTP, click "Verify" |
| Register | http://localhost:5173/signup | Fill form (no house fields!) |
| Verify Email | http://localhost:5173/email-verification | Enter email OTP |
| Login | http://localhost:5173/login | Use registered email + password |
| Access Dashboard | http://localhost:5173/admin/dashboard | After email verification |

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SPRING-FIELD SYSTEM                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  FRONTEND (React)                     BACKEND (Laravel)             │
│  ───────────────────                  ──────────────────            │
│                                                                       │
│  ┌──────────────────┐                 ┌──────────────────┐          │
│  │ Super Admin      │                 │ AuthController   │          │
│  │ Dashboard        │ Generate        │                  │          │
│  │ [Generate Token] │────────────────▶│ register()       │          │
│  └──────────────────┘                 │                  │          │
│         │                             │ + OTP validation │          │
│         │ Shows OTP modal             │ + House creation │          │
│         ▼                             │ + User creation  │          │
│  ┌──────────────────┐                 └──────────────────┘          │
│  │ OTP Modal        │                         │                     │
│  │ "123456"         │                         ▼                     │
│  │ [Copy Button]    │                 ┌──────────────────┐          │
│  └──────────────────┘                 │ RegistrationOtp  │          │
│         │                             │ Model            │          │
│         │ User copies                 │                  │          │
│         ▼                             │ + Validation     │          │
│  ┌──────────────────┐                 │ + Usage tracking │          │
│  │ /signup-otp      │                 └──────────────────┘          │
│  │ [Paste OTP]      │                         │                     │
│  │ [Verify Button]  │────────────────────────▶│                     │
│  └──────────────────┘  Verify OTP            │                     │
│         │                             ┌──────────────────┐          │
│         │ If valid                    │ Check:           │          │
│         ▼                             │ • Exists?        │          │
│  ┌──────────────────┐                 │ • Expired?       │          │
│  │ /signup          │                 │ • Already used?  │          │
│  │ [Registration]   │                 │ • Target role?   │          │
│  │ No House Fields! │                 └──────────────────┘          │
│  │                  │                         │                     │
│  │ ✅ First Name    │                         │ Return:             │
│  │ ✅ Last Name     │                         │ {target_role:       │
│  │ ✅ Email         │                         │  'landlord'}        │
│  │ ✅ Phone         │                         │                     │
│  │ ✅ Password      │                         │                     │
│  │ ❌ House         │                         │                     │
│  │ ❌ Address       │                         │                     │
│  │                  │                         │                     │
│  │ [Register Button]│───────────────────────▶│                     │
│  └──────────────────┘ Submit with OTP        │                     │
│         │                             ┌──────────────────┐          │
│         │ Success response            │ Register User:   │          │
│         ▼                             │ • Validate OTP   │          │
│  ┌──────────────────┐                 │ • Create User:   │          │
│  │ Success Modal    │                 │   role='landlord'│          │
│  │ "Verify Email"   │                 │   house_id=NULL  │          │
│  └──────────────────┘                 │ • Mark OTP used  │          │
│         │                             │ • Send email OTP │          │
│         ▼                             └──────────────────┘          │
│  ┌──────────────────┐                         │                     │
│  │ /email-          │                         ▼                     │
│  │ verification     │                 ┌──────────────────┐          │
│  │ [Enter Email OTP]│────────────────▶│ Send email OTP   │          │
│  │ [Verify Button]  │                 │ (EmailController)│          │
│  └──────────────────┘                 └──────────────────┘          │
│         │                                     │                     │
│         │ Email verified                      │                     │
│         ▼                                     ▼                     │
│  ┌──────────────────┐                 ┌──────────────────┐          │
│  │ /login           │                 │ Update User:     │          │
│  │ Email            │                 │ email_verified_at│          │
│  │ Password         │                 │ = NOW()          │          │
│  │ [Sign In Button] │────────────────▶│                  │          │
│  └──────────────────┘                 │ ✅ Email marked  │          │
│         │                             │    as verified   │          │
│         │ Check: Role='landlord'?     └──────────────────┘          │
│         │ Email verified?                    │                     │
│         │ Both YES?                          │ Return token +      │
│         ▼                                    │ user data          │
│  ┌──────────────────┐                       │                     │
│  │ /admin/dashboard │◀──────────────────────┘                     │
│  │ (Landlord View)  │                                              │
│  │                  │                                              │
│  │ Welcome, John!   │                                              │
│  │ [Home]           │                                              │
│  │ [Visitors]       │                                              │
│  │ [Users]          │                                              │
│  └──────────────────┘                                              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
INPUT:
  Super Admin ID → OTP Generation
                       ↓
OUTPUT:
  OTP Code (6 digits)
  Generated By: Super Admin ID
  Target Role: 'landlord'
  Expires At: NOW() + 24 hours


INPUT:
  OTP Code
       ↓
PROCESS:
  1. Check if exists → Must exist
  2. Check if expired → Must not be expired
  3. Check if used → Must not be already used
  4. Check target role → Must be 'landlord'
       ↓
OUTPUT:
  { success: true, target_role: 'landlord' }
       ↓
FRONTEND:
  Set targetRole='landlord'
  Redirect to /signup with otpCode


INPUT:
  Form Data + OTP Code + Target Role
       ↓
PROCESS:
  1. Validate user data (email, phone, password)
  2. Validate OTP again
  3. Create User:
     - role = target_role (= 'landlord')
     - house_id = NULL (not assigned)
     - email_verified_at = NULL (needs verification)
  4. Mark OTP as used
  5. Generate email verification OTP
       ↓
OUTPUT:
  User created with role='landlord'
  Email verification OTP sent


INPUT:
  Email OTP Code
       ↓
PROCESS:
  1. Check if OTP valid
  2. Mark email as verified
  3. Set email_verified_at = NOW()
       ↓
OUTPUT:
  Email verified, user can now login


INPUT:
  Email + Password
       ↓
PROCESS:
  1. Validate credentials
  2. Check email_verified_at is NOT null
  3. Check user role
  4. Generate authentication token
       ↓
OUTPUT:
  Token + user data with role='landlord'
       ↓
FRONTEND:
  Check role='landlord'?
  Redirect to /admin/dashboard
```

---

## Role-Based Access Control

```
┌─────────────────────────────────────┐
│ USER ROLE MATRIX                    │
├─────────────────────────────────────┤
│                                      │
│ SUPER ADMIN                          │
│ ├─ Can generate OTP ✅              │
│ ├─ Cannot register via OTP           │
│ ├─ Access: /super-admin/* ✅        │
│ └─ Dashboard: /super-admin/dashboard │
│                                      │
│ LANDLORD (via OTP)                   │
│ ├─ Cannot generate OTP               │
│ ├─ Can register via OTP ✅          │
│ ├─ Access: /admin/* ✅              │
│ ├─ Cannot access /super-admin/*      │
│ └─ Dashboard: /admin/dashboard       │
│                                      │
│ RESIDENT                             │
│ ├─ Cannot generate OTP               │
│ ├─ Can register (direct or OTP)      │
│ ├─ Access: /dashboard ✅            │
│ ├─ Cannot access /admin/*            │
│ └─ Dashboard: /dashboard             │
│                                      │
└─────────────────────────────────────┘
```

---

## OTP Lifecycle

```
Created:
┌─────────────────────────────────┐
│ OTP Record                       │
├─────────────────────────────────┤
│ otp_code: "123456"              │
│ generated_by: 1 (super admin)   │
│ target_role: 'landlord'         │
│ expires_at: 2025-11-12 18:10:34 │
│ used_at: null                   │
│ used_by: null                   │
│ is_active: true                 │
└─────────────────────────────────┘
            ↓
        Shared
            ↓
First Use:
┌─────────────────────────────────┐
│ OTP Record (After Registration) │
├─────────────────────────────────┤
│ otp_code: "123456"              │
│ generated_by: 1 (super admin)   │
│ target_role: 'landlord'         │
│ expires_at: 2025-11-12 18:10:34 │
│ used_at: 2025-11-11 20:15:42    │
│ used_by: 5 (new user ID)        │
│ is_active: true                 │
└─────────────────────────────────┘
            ↓
     (Cannot be used again)
```

---

## Form State Management

### OTP Registration (Via OTP Code)

```
LOCATION STATE:
{
  otpCode: "123456",
  targetRole: "landlord"
}

FORM VISIBILITY:
✅ firstName
✅ lastName
✅ email
✅ phoneNumber
✅ password
✅ confirmPassword
❌ houseNumber    (HIDDEN)
❌ address        (HIDDEN)
❌ description    (HIDDEN)

REQUEST TO BACKEND:
{
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  phone_number: "08012345678",
  password: "SecurePass123!",
  password_confirmation: "SecurePass123!",
  otp_code: "123456",         ← Included
  target_role: "landlord"     ← Included
}
```

### Direct Registration (No OTP)

```
LOCATION STATE:
{
  otpCode: null,
  targetRole: null
}

FORM VISIBILITY:
✅ firstName
✅ lastName
✅ email
✅ phoneNumber
✅ password
✅ confirmPassword
✅ houseNumber    (VISIBLE)
✅ address        (VISIBLE)
✅ description    (VISIBLE)

REQUEST TO BACKEND:
{
  first_name: "Jane",
  last_name: "Resident",
  email: "jane@example.com",
  phone_number: "08098765432",
  password: "SecurePass456!",
  password_confirmation: "SecurePass456!",
  house_number: "A101",        ← Included
  address: "123 Main Street",  ← Included
  description: "Ground floor"  ← Included
}
```

---

## Authentication Flow

```
┌──────────────────────────────────────────────┐
│ LOGIN ENDPOINT: POST /api/login              │
├──────────────────────────────────────────────┤
│                                              │
│ Input:                                       │
│   email: "john@example.com"                 │
│   password: "SecurePass123!"                │
│                                              │
│ Backend:                                     │
│   1. Find user by email                      │
│   2. Verify password hash                    │
│   3. Generate token                          │
│   4. Return token + user data                │
│                                              │
│ Output:                                      │
│ {                                            │
│   success: true,                             │
│   token: "eyJhbGc...",                      │
│   user: {                                    │
│     id: 5,                                   │
│     email: "john@example.com",              │
│     role: "landlord",    ← Key field        │
│     email_verified_at: "2025-11-11..."      │
│   }                                          │
│ }                                            │
└──────────────────────────────────────────────┘
            ↓
┌──────────────────────────────────────────────┐
│ FRONTEND ROUTING LOGIC                       │
├──────────────────────────────────────────────┤
│                                              │
│ Check: email_verified_at is not null?       │
│   NO  → Redirect to /email-verification    │
│   YES → Continue...                          │
│                                              │
│ Check: user.role?                           │
│   super       → /super-admin/dashboard     │
│   landlord    → /admin/dashboard           │
│   resident    → /dashboard                 │
│   security    → /dashboard                 │
│                                              │
└──────────────────────────────────────────────┘
            ↓
┌──────────────────────────────────────────────┐
│ APPROPRIATE DASHBOARD LOADED                │
├──────────────────────────────────────────────┤
│ For landlord: /admin/dashboard              │
│   ├─ Home (/admin/dashboard)               │
│   ├─ Visitors (/admin/visitors)            │
│   └─ Users (/admin/users)                  │
└──────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
USER ENTERS OTP
    ↓
Is OTP valid?
    ├─ NO → Error: "Invalid or expired OTP code"
    └─ YES ↓
    
Is OTP expired?
    ├─ YES → Error: "Invalid or expired OTP code"
    └─ NO ↓
    
Is OTP already used?
    ├─ YES → Error: "This OTP has already been used"
    └─ NO ↓
    
✅ VALID OTP
    ↓
Redirect to /signup


USER REGISTERS
    ↓
Validate email format?
    ├─ NO → Error: "Invalid email format"
    └─ YES ↓
    
Email already exists?
    ├─ YES → Error: "Email already taken"
    └─ NO ↓
    
Phone already exists?
    ├─ YES → Error: "Phone already registered"
    └─ NO ↓
    
Password meets requirements?
    ├─ NO → Error: "Password must contain..."
    └─ YES ↓
    
Passwords match?
    ├─ NO → Error: "Passwords do not match"
    └─ YES ↓
    
OTP valid in database?
    ├─ NO → Error: "Invalid or expired OTP code"
    └─ YES ↓
    
✅ REGISTRATION SUCCESSFUL
    ↓
User created with role='landlord'
Email verification OTP sent
Redirect to /email-verification
```

---

## Database Schema Diagram

```
┌────────────────────────────┐
│ USERS TABLE                │
├────────────────────────────┤
│ id (PK)                    │
│ full_name                  │
│ phone                      │
│ email                      │
│ password_hash              │
│ role ← "landlord"          │
│ house_id (FK) ← NULL       │
│ email_verified_at ← NULL   │
│ status_active              │
│ created_at                 │
│ updated_at                 │
└────────────────────────────┘
            ↑
            │ created via
            │
┌────────────────────────────┐
│ REGISTRATION_OTPS TABLE    │
├────────────────────────────┤
│ id (PK)                    │
│ otp_code                   │
│ generated_by (FK) ← super  │
│ target_role ← "landlord"   │
│ house_number ← NULL        │
│ address ← NULL             │
│ house_id (FK) ← NULL       │
│ expires_at                 │
│ used_at ← timestamp        │
│ used_by (FK) ← user id     │
│ is_active                  │
│ created_at                 │
│ updated_at                 │
└────────────────────────────┘
```

---

## Testing Checklist (Visual)

```
┌─ GENERATE OTP ─────────────────┐
│ ✅ Super admin can generate    │
│ ✅ OTP is 6 digits             │
│ ✅ Shows expiry time           │
│ ✅ Copy button works           │
└────────────────────────────────┘
            ↓
┌─ VERIFY OTP ───────────────────┐
│ ✅ Valid OTP accepted          │
│ ✅ Invalid OTP rejected        │
│ ✅ Expired OTP rejected        │
│ ✅ Used OTP rejected           │
│ ✅ Redirects to /signup        │
└────────────────────────────────┘
            ↓
┌─ REGISTER FORM ────────────────┐
│ ✅ House fields HIDDEN         │
│ ✅ Can fill all required fields│
│ ✅ Form validates              │
│ ✅ Submits with OTP code       │
└────────────────────────────────┘
            ↓
┌─ CREATE USER ──────────────────┐
│ ✅ User created                │
│ ✅ role='landlord'             │
│ ✅ house_id=NULL               │
│ ✅ Email not verified yet      │
│ ✅ OTP marked as used          │
└────────────────────────────────┘
            ↓
┌─ VERIFY EMAIL ─────────────────┐
│ ✅ Email OTP sent              │
│ ✅ Can enter and verify        │
│ ✅ Marks email verified        │
└────────────────────────────────┘
            ↓
┌─ LOGIN ────────────────────────┐
│ ✅ Can login with credentials  │
│ ✅ Email verified check passes │
│ ✅ Role check passes           │
│ ✅ Redirects to /admin/dash... │
└────────────────────────────────┘
            ↓
┌─ DASHBOARD ────────────────────┐
│ ✅ /admin/dashboard loads      │
│ ✅ Admin navigation visible    │
│ ✅ Can access /admin/visitors  │
│ ✅ Can access /admin/users     │
│ ✅ Cannot access /super-admin/*│
│ ✅ Cannot access /dashboard    │
└────────────────────────────────┘
```

---

## Success Indicators

When everything is working correctly, you'll see:

```
✅ OTP appears as 6-digit number
✅ House fields disappear on /signup
✅ User created without database errors
✅ Email verification required
✅ Login redirects to /admin/dashboard (not /dashboard)
✅ Admin navigation shows (not resident navigation)
✅ Can access admin features
✅ Browser console has no errors
✅ Network tab shows all API calls successful
```

---

## One-Page Summary

```
SUPER ADMIN          NEW USER            SYSTEM
────────────         ────────            ──────

Clicks "Generate"
                     Receives OTP        Creates: OTP record
                                         - otp_code: 123456
                                         - target_role: landlord
                                         - expires_at: +24h

                     Goes to /signup-otp
                     Enters OTP          Validates OTP
                     Clicks "Verify"     ✅ Valid → Set target_role
                                         ❌ Invalid → Error
                     
                     Redirected to /signup
                     Fills form          otpCode + targetRole
                     (no house fields!)  in state
                     
                     Clicks "Register"   Creates User:
                                         - role='landlord'
                                         - house_id=NULL
                     
                     Sees success modal  Sends email OTP
                     
                     Redirected to
                     /email-verification
                     
                     Enters email OTP    Verifies email
                     
                     Redirected to /login
                     
                     Enters credentials
                     Clicks "Sign In"    Generates token
                                         Checks role='landlord'
                                         Checks email verified
                     
                     Redirected to       User is now
                     /admin/dashboard    LANDLORD! ✅
```

---

**Use these diagrams to understand the complete flow!** 📊

