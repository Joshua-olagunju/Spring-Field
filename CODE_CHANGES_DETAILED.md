# Code Changes Summary: House Type Field in Users Table

## 1️⃣ Migration File

**File**: `backend/database/migrations/2025_11_12_000000_add_house_type_to_users_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add house_type column after house_id
            $table->string('house_type')->nullable()->default('room_self')->after('house_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('house_type');
        });
    }
};
```

---

## 2️⃣ User Model Changes

**File**: `backend/app/Models/User.php`

### Before

```php
protected $fillable = [
    'full_name',
    'phone',
    'email',
    'password_hash',
    'role',
    'house_id',
    'status_active',
    'email_verified_at',
];
```

### After

```php
protected $fillable = [
    'full_name',
    'phone',
    'email',
    'password_hash',
    'role',
    'house_id',
    'house_type',  // ← ADDED
    'status_active',
    'email_verified_at',
];
```

---

## 3️⃣ AuthController Registration Changes

**File**: `backend/app/Http/Controllers/Api/AuthController.php`

### Change 1: User Data Creation with house_type

**Before**

```php
// Add house_id for non-super users
if ($userRole !== User::ROLE_SUPER && $house) {
    $userData['house_id'] = $house->id;
}
```

**After**

```php
// Add house_id and house_type for non-super users
if ($userRole !== User::ROLE_SUPER) {
    if ($house) {
        $userData['house_id'] = $house->id;
    }
    $userData['house_type'] = $houseType;
}
```

### Change 2: Registration Response

**Before**

```php
$responseData = [
    'user' => [
        'id' => $user->id,
        'full_name' => $user->full_name,
        'email' => $user->email,
        'phone' => $user->phone,
        'role' => $user->role,
        'status_active' => $user->status_active,
        'email_verified' => $user->hasVerifiedEmail(),
        'house' => $house ? [
            'id' => $house->id,
            'house_number' => $house->house_number,
            'house_type' => $house->house_type,
            'address' => $house->address,
        ] : null
    ],
    // ...
];
```

**After**

```php
$responseData = [
    'user' => [
        'id' => $user->id,
        'full_name' => $user->full_name,
        'email' => $user->email,
        'phone' => $user->phone,
        'role' => $user->role,
        'house_type' => $user->house_type,  // ← ADDED
        'status_active' => $user->status_active,
        'email_verified' => $user->hasVerifiedEmail(),
        'house' => $house ? [
            'id' => $house->id,
            'house_number' => $house->house_number,
            'house_type' => $house->house_type,
            'address' => $house->address,
        ] : null
    ],
    // ...
];
```

### Change 3: Login Response

**Before**

```php
return response()->json([
    'success' => true,
    'message' => 'Login successful',
    'user' => [
        'id' => $user->id,
        'full_name' => $user->full_name,
        'email' => $user->email,
        'phone' => $user->phone,
        'role' => $user->role,
        'status_active' => $user->status_active,
        'email_verified_at' => $user->email_verified_at,
        'house' => $user->house ? [
            'id' => $user->house->id,
            'house_number' => $user->house->house_number,
            'house_type' => $user->house->house_type,
            'address' => $user->house->address,
        ] : null
    ],
    'token' => $token
]);
```

**After**

```php
return response()->json([
    'success' => true,
    'message' => 'Login successful',
    'user' => [
        'id' => $user->id,
        'full_name' => $user->full_name,
        'email' => $user->email,
        'phone' => $user->phone,
        'role' => $user->role,
        'house_type' => $user->house_type,  // ← ADDED
        'status_active' => $user->status_active,
        'email_verified_at' => $user->email_verified_at,
        'house' => $user->house ? [
            'id' => $user->house->id,
            'house_number' => $user->house->house_number,
            'house_type' => $user->house->house_type,
            'address' => $user->house->address,
        ] : null
    ],
    'token' => $token
]);
```

---

## 📊 Database Changes

### Users Table Column Addition

**SQL Equivalent**:

```sql
ALTER TABLE `users` ADD COLUMN `house_type` VARCHAR(255) NULLABLE DEFAULT 'room_self' AFTER `house_id`;
```

**Column Details**:

- **Column Name**: `house_type`
- **Data Type**: `VARCHAR(255)`
- **Default Value**: `'room_self'`
- **Nullable**: Yes
- **Position**: After `house_id` column

---

## 🧪 Testing the Changes

### Test Case 1: Register a New User

```bash
POST /api/register
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone_number": "09012345678",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "otp_code": "123456",
  "house_number": "10",
  "address": "Main Street",
  "house_type": "2_bedroom"
}
```

**Expected Response**:

```json
{
  "success": true,
  "user": {
    "id": 5,
    "house_type": "2_bedroom"  ← NEW FIELD
  }
}
```

**Database Verification**:

```sql
SELECT id, full_name, house_type FROM users WHERE id = 5;
-- Result: 5, "John Doe", "2_bedroom"
```

### Test Case 2: Login

```bash
POST /api/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response**:

```json
{
  "success": true,
  "user": {
    "id": 5,
    "house_type": "2_bedroom"  ← NEW FIELD
  },
  "token": "..."
}
```

---

## 🔄 How house_type Flows Through System

1. **Frontend** (Signup.jsx)

   - User selects house_type from dropdown
   - Sent in registration request

2. **Backend** (AuthController)

   - `register()` method receives house_type
   - Validates against allowed options
   - Stores in `$userData['house_type']`

3. **Database** (users table)

   - New `house_type` column stores the value
   - Persisted for each user record

4. **API Response**

   - Both registration and login responses include house_type
   - Frontend can use it from UserContext

5. **Frontend** (Dashboard)
   - Displays house_type from UserContext
   - Can query API anytime to get latest value

---

## ✨ Key Features

✅ house_type stored per user in users table
✅ Included in registration API response
✅ Included in login API response
✅ Default value: 'room_self'
✅ Supports all house types: room_self, room_and_parlor, 2_bedroom, 3_bedroom, duplex
✅ Super admins get NULL for house_type
✅ Migration is reversible

---

## 📝 Notes

- The `house_type` column is separate from the house's house_type in the houses table
- User's house_type represents what they selected during registration
- Houses table also has house_type for property classification
- Both are included in API responses for flexibility
