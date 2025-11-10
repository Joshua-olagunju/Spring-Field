# Quick Reference Guide - Email Verification System

## 🚀 Quick Start

### 1. Start the Services
```bash
# Terminal 1: Start Laravel server
cd backend
php artisan serve

# Terminal 2: Start React frontend
npm run dev
```

### 2. Test Registration
- Go to: `http://localhost:5173/signup`
- Fill form and register
- You'll be sent to email verification page
- Check your email inbox for OTP code

### 3. Verify Email
- Enter 6-digit OTP from email
- Click "Verify Email"
- You'll be redirected to your role-specific dashboard

---

## 🔑 Key Components

### Backend
| File | Purpose |
|------|---------|
| `EmailVerification.php` | OTP model & logic |
| `EmailVerificationController.php` | Email verification endpoints |
| `AuthController.php` | Registration & OTP sending |
| `EmailVerificationMail.php` | Email template class |

### Frontend  
| File | Purpose |
|------|---------|
| `Signup.jsx` | Registration form |
| `EmailVerificationOtp.jsx` | OTP verification form |
| `*Dashboard.jsx` (4 files) | Role-specific dashboards |

---

## 📡 API Endpoints

```
POST /api/register
├─ Creates user
├─ Generates OTP
├─ Saves to DB
└─ Sends email

POST /api/email-verification/verify
├─ Checks OTP validity
├─ Updates user verification
└─ Returns success/error

POST /api/email-verification/resend-otp
├─ Generates new OTP
├─ Deletes old OTP
├─ Sends new email
└─ Rate limited (60s)

GET /api/email-verification/status
└─ Returns verification status
```

---

## 🗄️ Database Tables

### users
- `id` - User ID
- `email` - Email address
- `email_verified_at` - Verification timestamp (NULL = not verified)
- `role` - User role (super, landlord, resident, security)

### email_verifications
- `id` - Record ID
- `user_id` - References users table
- `otp_code` - 6-digit OTP
- `expires_at` - Expiration time (10 min default)
- `verified_at` - When it was verified
- `attempts` - Failed attempt count

---

## 🎯 User Roles & Dashboards

| Role | Dashboard | Route |
|------|-----------|-------|
| super | Super Admin | `/admin-dashboard` |
| landlord | Landlord | `/landlord-dashboard` |
| resident | Resident | `/resident-dashboard` |
| security | Security | `/security-dashboard` |

**Special Case**: First 3 users auto-become super admin and email is auto-verified

---

## 📧 Email Configuration

### .env File
```env
MAIL_MAILER=smtp
MAIL_HOST=mail.firmaflowledger.com
MAIL_PORT=587
MAIL_USERNAME=temporary@firmaflowledger.com
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@springfield.com
MAIL_FROM_NAME=Spring Field Estate
```

---

## ✅ Testing Checklist

- [ ] Register new user
- [ ] Receive OTP email
- [ ] Verify with correct OTP
- [ ] Check email_verified_at in database
- [ ] Verify redirected to correct dashboard
- [ ] Test resend OTP (60s cooldown)
- [ ] Test invalid OTP (should fail)
- [ ] Test expired OTP (10 min expiry)
- [ ] Test 5+ attempts (should lock out)

---

## 🔍 Quick Database Checks

### Check All Users
```sql
SELECT id, full_name, email, role, 
       CASE WHEN email_verified_at IS NULL THEN 'Not Verified' 
            ELSE 'Verified' END as status
FROM users ORDER BY id DESC;
```

### Check Pending OTPs
```sql
SELECT * FROM email_verifications 
WHERE verified_at IS NULL 
AND expires_at > NOW();
```

### Mark User as Verified (Manual)
```sql
UPDATE users 
SET email_verified_at = NOW() 
WHERE email = 'user@example.com';
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| OTP not sent | Check SMTP settings in .env |
| OTP verification fails | Verify OTP hasn't expired, code is correct |
| Wrong dashboard | Check user role in database |
| Can't resend OTP | Wait 60 seconds or check rate limit |
| OTP not in DB | Check `email_verifications` table exists |

---

## 📚 Full Documentation

- **Complete Guide**: `EMAIL_VERIFICATION_SYSTEM.md`
- **Testing Guide**: `TESTING_GUIDE.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`

---

## 🚀 Production Deployment

1. Update SMTP credentials
2. Remove OTP from API responses
3. Configure production domain
4. Set appropriate OTP expiration
5. Enable rate limiting
6. Set up monitoring/logging
7. Test with real emails
8. Monitor failed attempts

---

## 💡 Key Features

✅ All users must verify email with OTP
✅ OTP saved to database (not just sent)
✅ 6-digit code expires in 10 minutes
✅ Maximum 5 failed attempts
✅ 60-second cooldown for resend
✅ Role-based dashboard redirect
✅ Super admin auto-verification
✅ Professional email templates
✅ Error handling & validation
✅ Complete audit trail in database

---

## 📞 Support

**Need Help?**
1. Check the documentation files
2. Review test cases in TESTING_GUIDE.md
3. Check Laravel logs: `storage/logs/laravel.log`
4. Verify database tables exist
5. Confirm SMTP configuration

---

## ⚡ File Locations

| Type | Location |
|------|----------|
| Models | `backend/app/Models/` |
| Controllers | `backend/app/Http/Controllers/Api/` |
| Mail | `backend/app/Mail/` |
| Views | `backend/resources/views/emails/` |
| Frontend Components | `src/screens/` |
| Routes | `backend/routes/api.php` |
| Database | `backend/database/sql/` |
| Documentation | Root directory |

---

## 🎓 Architecture Overview

```
User Registration Flow:
┌─────────────┐
│   Signup    │ User enters details
└──────┬──────┘
       │
       ↓
┌─────────────────────┐
│ AuthController      │ Creates user, generates OTP
│ Register Method     │ Saves to email_verifications table
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│ EmailVerificationMail│ Sends professional email
│ SMTP Gateway        │ 
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│ Frontend            │ Shows OTP input screen
│ EmailVerificationOtp│
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│ EmailVerification   │ Verify OTP against database
│ Controller          │ Mark email_verified_at
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│ Dashboard Screen    │ Role-based redirect
│ (4 dashboards)      │
└─────────────────────┘
```

---

**Everything is ready to use! 🎉**

