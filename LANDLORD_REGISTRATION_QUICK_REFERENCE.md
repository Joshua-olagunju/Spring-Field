# Quick Reference - Landlord Registration Enhancement

## What Changed?

### 1. Status Activation ✅
When landlord verifies email → `status_active` becomes `true` automatically

**File**: `EmailVerificationController.php` (Lines ~135-138)

### 2. House Number Field ✅
Landlords registering via OTP must provide house number

**File**: `Signup.jsx` (Added to formData & form submission)

### 3. House Type Dropdown ✅
New dropdown with 5 property types shown when registering via OTP

**Options**:
- Room Self
- Room and Parlor
- 2-Bedroom
- 3-Bedroom
- Duplex

**Files**: 
- `Signup.jsx` (UI)
- `AuthController.php` (validation)
- `houses` table (database)

---

## Form Visibility

### OTP Registration (Landlord)
```
✅ House Number (REQUIRED)
✅ House Type Dropdown (REQUIRED)
✅ Address (OPTIONAL)
❌ Description (HIDDEN)
```

### Direct Registration (No OTP)
```
✅ House Number (REQUIRED)
✅ Address (REQUIRED)
✅ Description (OPTIONAL)
❌ House Type Dropdown (HIDDEN)
```

---

## Database Fields

### Houses Table
| Field | Type | Required | Default |
|-------|------|----------|---------|
| id | INT | Yes | Auto |
| landlord_id | INT | Yes | - |
| house_number | VARCHAR(50) | Yes | - |
| address | VARCHAR(255) | No | NULL |
| **house_type** | VARCHAR(50) | No | room_self |
| created_at | TIMESTAMP | Yes | NOW |

---

## API Request (OTP Registration)

```json
POST /api/register

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone_number": "08012345678",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "otp_code": "123456",
  "target_role": "landlord",
  "house_number": "A101",
  "house_type": "2_bedroom",
  "address": "123 Main Street"
}
```

---

## Testing Quick Checklist

- [ ] Generate OTP from Super Admin dashboard
- [ ] Enter OTP on /signup-otp
- [ ] Form shows house fields (number, type, address)
- [ ] Select house type from dropdown
- [ ] Register successfully
- [ ] Verify database: house created with house_type
- [ ] Verify email
- [ ] Database: status_active = 1
- [ ] Login successfully
- [ ] Redirected to /admin/dashboard

---

## Files Changed

### Frontend
- `src/screens/authenticationScreens/Signup.jsx`

### Backend
- `backend/app/Http/Controllers/Api/AuthController.php`
- `backend/app/Http/Controllers/Api/EmailVerificationController.php`
- `backend/app/Models/House.php`

### Database
- `backend/database/sql/add_house_type_column.sql`

---

## Key Features

| Feature | Status | Details |
|---------|--------|---------|
| Status Activation | ✅ Done | Auto-activated on email verify |
| House Number | ✅ Done | Required for OTP registration |
| House Type | ✅ Done | 5 dropdown options |
| Database Column | ✅ Done | Added to houses table |
| Form Visibility | ✅ Done | Conditional rendering |
| Validation | ✅ Done | Backend + frontend |
| Response Updates | ✅ Done | All endpoints return house_type |

---

## How It Works

```
Super Admin generates OTP
    ↓
Landlord enters OTP (/signup-otp)
    ↓
Form shows: House Number + House Type + Address
    ↓
Landlord fills form + selects house type
    ↓
Backend creates user + house with house_type
    ↓
Backend sends email verification OTP
    ↓
Landlord verifies email
    ↓
status_active automatically = true
    ↓
Landlord can now login
    ↓
Login redirects to /admin/dashboard
```

---

## Validation Rules

### House Number
- Required (if OTP registration)
- Max 50 characters
- String

### House Type
- Required (if OTP registration)
- Must be one of: room_self, room_and_parlor, 2_bedroom, 3_bedroom, duplex
- String

### Address
- Optional (if OTP registration)
- Max 255 characters
- String

---

## Status Activation Logic

```php
// In EmailVerificationController.php
if ($user->role === User::ROLE_LANDLORD && !$user->status_active) {
    $user->update(['status_active' => true]);
}
```

**When**: Email verification succeeds  
**For**: Landlords only  
**Result**: User can now login and access /admin/dashboard

---

## Response Example

### After Registration
```json
{
  "success": true,
  "data": {
    "user": {
      "role": "landlord",
      "status_active": false,
      "house": {
        "house_number": "A101",
        "house_type": "2_bedroom",
        "address": "123 Main Street"
      }
    }
  }
}
```

### After Email Verification
```json
{
  "success": true,
  "user": {
    "role": "landlord",
    "status_active": true
  },
  "token": "eyJhbGc..."
}
```

### After Login
```json
{
  "success": true,
  "user": {
    "role": "landlord",
    "status_active": true,
    "house": {
      "house_number": "A101",
      "house_type": "2_bedroom",
      "address": "123 Main Street"
    }
  },
  "token": "eyJhbGc..."
}
```

---

## Backward Compatibility

✅ Non-OTP registrations still work  
✅ Address field still works for direct registration  
✅ No existing data modified  
✅ house_type has default value (room_self)  
✅ Existing houses still work without house_type

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Form doesn't show house fields | Check otpCode in location state |
| House type dropdown empty | Check options in Signup.jsx |
| Status not activating | Check role is 'landlord' |
| House not created | Check house_number is provided |
| Validation errors | Check all required fields filled |
| Database error | Check houses table has house_type column |

---

## Support Commands

### Check if house_type column exists
```sql
DESCRIBE houses;
```

### Check landlord created with house_type
```sql
SELECT h.*, u.full_name, u.role, u.status_active 
FROM houses h 
JOIN users u ON h.landlord_id = u.id 
WHERE u.role = 'landlord' 
ORDER BY h.created_at DESC LIMIT 1;
```

### Check status activation
```sql
SELECT id, full_name, role, status_active, email_verified_at 
FROM users 
WHERE role = 'landlord' 
ORDER BY id DESC LIMIT 1;
```

---

**Status**: ✅ FULLY IMPLEMENTED AND READY FOR TESTING

Next: Run comprehensive tests from LANDLORD_REGISTRATION_ENHANCEMENT.md
