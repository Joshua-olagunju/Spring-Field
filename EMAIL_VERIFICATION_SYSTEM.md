# Spring Field Estate - Email Verification System

## Complete Email Verification & Role-Based Dashboard Flow

### 📋 Overview

When a user registers in the Spring Field Estate application, they must verify their email address with an OTP (One-Time Password) before they can fully access the system. After verification, they are automatically redirected to their role-specific dashboard.

---

## 🔄 Complete User Flow

### Step 1: User Registration
- **Endpoint**: `POST /api/register`
- **What Happens**:
  1. User fills in registration form (name, email, phone, password, house number, address)
  2. Form is validated on the frontend
  3. Data is sent to Laravel backend
  4. Backend validates the data and creates the user account
  5. An OTP code (6 digits) is generated and saved to `email_verifications` table
  6. OTP email is sent to the user's email address
  7. User is redirected to the email verification page

**Backend Response Includes**:
```json
{
  "success": true,
  "message": "Registration successful! Please check your email...",
  "data": {
    "user": {
      "id": 10,
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "resident",
      "email_verified": false
    },
    "email_verification": {
      "required": true,
      "sent": true,
      "message": "Verification email sent",
      "otp_code": "123456"
    }
  }
}
```

### Step 2: Frontend Navigation to Email Verification
- **File**: `src/screens/authenticationScreens/Signup.jsx`
- **Route**: `/email-verification`
- **Data Passed**:
  - `email`: User's email address
  - `user_id`: User's database ID
  - `role`: User's role (super, landlord, resident, security)

```javascript
navigate("/email-verification", { 
  state: { 
    email: userEmail, 
    user_id: userId, 
    role: userRole 
  } 
});
```

### Step 3: Email Verification
- **File**: `src/screens/authenticationScreens/EmailVerificationOtp.jsx`
- **What User Sees**:
  1. Email verification page with 6 OTP input fields
  2. Email address is displayed
  3. Option to resend OTP

**User Actions**:
1. Receives email with OTP code
2. Enters OTP code digit by digit
3. Clicks "Verify Email" button

### Step 4: Backend Verification
- **Endpoint**: `POST /api/email-verification/verify`
- **Request Data**:
```json
{
  "user_id": 10,
  "email": "john@example.com",
  "otp_code": "123456"
}
```

**Backend Process**:
1. Checks if user exists
2. Finds OTP record in `email_verifications` table
3. Verifies OTP code matches
4. Checks if OTP has expired
5. Limits verification attempts (max 5)
6. If valid: Marks email as verified in `users` table (`email_verified_at` field)
7. Returns success response

**Success Response**:
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": 10,
      "full_name": "John Doe",
      "email": "john@example.com",
      "email_verified_at": "2025-11-10 18:30:45"
    }
  }
}
```

### Step 5: Role-Based Dashboard Redirection
- **File**: `src/screens/authenticationScreens/EmailVerificationOtp.jsx`
- **Logic**:

```javascript
const dashboardRoutes = {
  super: "/admin-dashboard",
  landlord: "/landlord-dashboard",
  resident: "/resident-dashboard",
  security: "/security-dashboard"
};

const route = dashboardRoutes[userRole] || "/dashboard";
navigate(route, { state: { userId, userRole } });
```

**Dashboard Files**:
- Super Admin: `src/screens/DashboradScreen/SuperAdminDashboard.jsx`
- Landlord: `src/screens/DashboradScreen/LandlordDashboard.jsx`
- Resident: `src/screens/DashboradScreen/ResidentDashboard.jsx`
- Security: `src/screens/DashboradScreen/SecurityDashboard.jsx`

---

## 🗄️ Database Tables

### users table
```sql
- id (PRIMARY KEY)
- full_name
- email
- phone
- password_hash
- role (super, landlord, resident, security)
- email_verified_at (TIMESTAMP, NULL until verified)
- status_active
- house_id
- created_at
- updated_at
```

### email_verifications table
```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY → users.id)
- email (varchar)
- otp_code (6 digits)
- expires_at (TIMESTAMP, default 10 minutes)
- verified_at (TIMESTAMP, NULL until verified)
- attempts (int, tracks failed attempts)
- created_at
- updated_at
```

---

## 📧 Email Templates

### 1. Email Verification Mail
**File**: `backend/resources/views/emails/email-verification.blade.php`
- Professional HTML template
- Contains 6-digit OTP code
- Shows expiration time
- Includes security tips

**Text Version**: `backend/resources/views/emails/email-verification-text.blade.php`

### 2. Mail Class
**File**: `backend/app/Mail/EmailVerificationMail.php`
- Extends Laravel's Mailable class
- Sends HTML and text versions
- Subject: "Spring Field Estate - Verify Your Email Address"

---

## 🔌 API Endpoints

### Email Verification Endpoints

#### 1. Send Verification OTP
```
POST /api/email-verification/send-otp
Body: {
  "user_id": 10,
  "email": "user@example.com"
}
Response: {
  "success": true,
  "message": "Verification OTP sent to your email",
  "otp_code": "123456" // Remove in production
}
```

#### 2. Verify Email with OTP
```
POST /api/email-verification/verify
Body: {
  "user_id": 10,
  "email": "user@example.com",
  "otp_code": "123456"
}
Response: {
  "success": true,
  "message": "Email verified successfully",
  "user": { ... }
}
```

#### 3. Resend Verification OTP
```
POST /api/email-verification/resend-otp
Body: {
  "user_id": 10,
  "email": "user@example.com"
}
Response: {
  "success": true,
  "message": "New verification OTP sent to your email"
}
```

#### 4. Check Verification Status
```
GET /api/email-verification/status
Body: {
  "user_id": 10
}
Response: {
  "success": true,
  "data": {
    "is_verified": false,
    "has_pending_otp": true,
    "verified_at": null
  }
}
```

---

## 🔒 Security Features

1. **OTP Expiration**: 10 minutes (configurable)
2. **Attempt Limiting**: Maximum 5 verification attempts
3. **Rate Limiting**: Can't request new OTP if one is pending
4. **No OTP Reuse**: Old OTPs are deleted when new ones are generated
5. **Email Validation**: Verifies email matches user account
6. **Secure Hashing**: Passwords are hashed with bcrypt

---

## ✅ Special Case: Super Admin Auto-Verification

The **first 3 users** automatically become Super Admins and have their email automatically verified:

```php
if ($isFirstThreeUsers) {
    $userRole = User::ROLE_SUPER;
    // Auto-verify email for super admins
    $user->markEmailAsVerified();
    // Immediate token issued
    $token = $user->createToken('auth_token')->plainTextToken;
}
```

---

## 🧪 Testing

### Test Scenario 1: Normal User Registration
1. Go to `/signup`
2. Fill registration form
3. Click "Register"
4. Should be redirected to `/email-verification`
5. Should see email displayed
6. Should receive email with OTP (check mailbox)
7. Enter OTP code
8. Click "Verify Email"
9. Should be redirected to role-specific dashboard

### Test Scenario 2: Super Admin Registration (First 3 Users)
1. Register user 1 → Becomes Super Admin
2. Email auto-verified
3. Redirected to `/admin-dashboard`

### Test Scenario 3: Resend OTP
1. On email verification page
2. Click "Didn't receive code? Resend"
3. Should show 60-second countdown
4. After 60 seconds, can request new OTP
5. Should receive new email with new OTP code

---

## 📝 Environment Configuration

### SMTP Settings (backend/.env)
```
MAIL_MAILER=smtp
MAIL_HOST=mail.firmaflowledger.com
MAIL_PORT=587
MAIL_USERNAME=temporary@firmaflowledger.com
MAIL_PASSWORD=your_password_here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@springfield.com
MAIL_FROM_NAME="Spring Field Estate"
```

---

## 🚀 Deployment Notes

1. **Remove OTP Codes from Production**:
   - In responses, remove `otp_code` field
   - Line in `EmailVerificationOtp.jsx`: `'otp_code': $result['otp_code'] ?? null`

2. **Email Configuration**:
   - Update SMTP credentials with production mailbox
   - Configure proper email sender name/address

3. **Dashboard Routes**:
   - Currently placeholder dashboards
   - Implement actual dashboard features per role

4. **Rate Limiting**:
   - Consider implementing rate limiting on verification endpoints
   - Prevent brute force attacks

---

## 📦 Models & Controllers

### Models
- **User** (`app/Models/User.php`)
  - `hasVerifiedEmail()` - Check if email is verified
  - `markEmailAsVerified()` - Mark as verified
  - `sendEmailVerificationOtp()` - Send OTP email
  - `emailVerifications()` - Relationship to EmailVerification

- **EmailVerification** (`app/Models/EmailVerification.php`)
  - `generateOtp()` - Create new OTP
  - `verifyOtp()` - Verify OTP code
  - `hasPendingVerification()` - Check if OTP pending
  - `isEmailVerified()` - Check if email is verified

### Controllers
- **AuthController** (`app/Http/Controllers/Api/AuthController.php`)
  - Handles user registration
  - Sends email verification OTP

- **EmailVerificationController** (`app/Http/Controllers/Api/EmailVerificationController.php`)
  - `sendVerificationOtp()` - Send OTP
  - `verifyEmail()` - Verify with OTP
  - `resendVerificationOtp()` - Resend OTP
  - `checkVerificationStatus()` - Check status

---

## 🎯 Key Files Modified/Created

### Frontend
- ✅ `src/screens/authenticationScreens/Signup.jsx` - Updated to pass role
- ✅ `src/screens/authenticationScreens/EmailVerificationOtp.jsx` - Updated verification logic
- ✅ `src/screens/DashboradScreen/SuperAdminDashboard.jsx` - New
- ✅ `src/screens/DashboradScreen/LandlordDashboard.jsx` - Updated
- ✅ `src/screens/DashboradScreen/ResidentDashboard.jsx` - Updated
- ✅ `src/screens/DashboradScreen/SecurityDashboard.jsx` - New
- ✅ `src/App.jsx` - Added new routes

### Backend
- ✅ `app/Models/EmailVerification.php` - New
- ✅ `app/Models/User.php` - Updated with verification methods
- ✅ `app/Http/Controllers/Api/EmailVerificationController.php` - New
- ✅ `app/Http/Controllers/Api/AuthController.php` - Updated
- ✅ `app/Mail/EmailVerificationMail.php` - New
- ✅ `resources/views/emails/email-verification.blade.php` - New
- ✅ `resources/views/emails/email-verification-text.blade.php` - New
- ✅ `database/sql/create_email_verifications_table.sql` - New
- ✅ `routes/api.php` - Updated with email verification routes

---

## ✨ Future Enhancements

1. Two-factor authentication (2FA)
2. Email change verification
3. Account lockout after failed attempts
4. SMS OTP option
5. Social login integration
6. Session management per dashboard
7. Real-time notifications for OTP

---

## 📞 Support

For issues with email verification:
1. Check SMTP configuration in `.env`
2. Verify `email_verifications` table exists
3. Check user `email_verified_at` field
4. Review logs for email sending errors
5. Ensure OTP hasn't expired (10 minutes)

