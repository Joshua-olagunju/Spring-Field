# Visitor Token System Integration

## Backend Setup

1. **Run the migration** (if tables don't exist):

```bash
cd backend
php artisan migrate
```

2. **Check if tables exist**:

- The system should already have `visitor_tokens` and `visitor_entries` tables
- If not, the migration will create them

## Frontend Integration Complete

### ✅ **What's Been Implemented:**

#### **1. Visitor Token Generation (VisitorsGenerationToken.jsx)**

- **Real API Integration**: Connects to `http://localhost:8000/api/visitor-tokens/generate`
- **Enhanced Form**: Added visitor phone and note fields
- **Backend Data**: Shows generated token with resident info (name, house, address)
- **Session Management**: Tokens stay active until used or expired

#### **2. Token Verification (TokenVerificationModal.jsx)**

- **Real API Integration**: Connects to `http://localhost:8000/api/visitor-tokens/verify`
- **Complete Resident Info**: Shows generator's name, phone, house number, and address
- **Entry Logging**: When security grants entry, it logs to database
- **Session Tracking**: Tracks visitor entry and exit times

#### **3. Database Schema**

```sql
visitor_tokens:
- id, resident_id, token_hash, issued_for_name, issued_for_phone
- visit_type, note, expires_at, used_at, created_at

visitor_entries:
- id, token_id, visitor_name, visitor_phone, entered_at, exited_at
- guard_id, gate_id, duration_minutes, note, created_at
```

### **🔄 Real-time Session Management:**

1. **Token Generation**:

   - Creates secure token in database
   - Links to resident who generated it
   - Stores visitor info and expiry time

2. **Token Verification**:

   - Checks if token exists, is valid, and not expired
   - Shows complete visitor and generator information
   - Security personnel sees: resident name, phone, house number, address

3. **Entry Logging**:

   - When security grants entry, token is marked as "used"
   - Creates visitor_entry record with timestamp
   - Links to guard who granted access

4. **Session Active Until**:
   - Manual exit logging (future feature)
   - Token expiry (automatic)
   - Manual session termination by admin

### **🔐 Security Features:**

- **Unique Tokens**: SHA256 hashed tokens prevent duplication
- **Expiry Control**: Automatic expiry based on stay type
- **Usage Tracking**: Prevents token reuse
- **Audit Trail**: Complete log of who granted access when
- **Authentication**: All APIs require valid auth token

### **📱 Usage Flow:**

1. **Resident/Admin**: Generates token for expected visitor
2. **Shares Token**: Via QR code or message with visitor details
3. **Visitor Arrives**: Presents token at gate
4. **Security Scans/Inputs**: Token verification shows all details
5. **Entry Granted**: System logs entry and marks token as used
6. **Session Tracking**: Visitor entry recorded with timestamps

### **🚀 Ready to Test:**

1. Login as resident/admin
2. Generate visitor token with name and phone
3. Share QR code or token string
4. Login as security personnel
5. Verify token to see complete resident info
6. Grant entry to log session in database

The system now maintains real-time session management with complete audit trails and proper database integration!
