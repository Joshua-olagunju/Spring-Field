# 🎫 Visitor Token System - Complete Documentation

## 📋 Overview

The Visitor Token System manages visitor access to your estate with QR code-based tokens. Here's how it works:

---

## 🔄 Token Lifecycle

### 1. **Token Generation** (By Residents/Admins)

- Resident generates a token with visitor details
- System creates a unique QR code (format: `VT-XXXXXXXX`)
- Token has an expiration time based on visit type:
  - **Short visits**: Hours (1-24)
  - **Long visits**: Days (1-30)
- Token status: `PENDING` (not yet used)

### 2. **Token Verification** (By Security)

- Security scans QR code or enters token manually
- System validates the token:
  - ✅ Token exists
  - ✅ Not expired
  - ✅ Not already used
- Shows visitor and host information

### 3. **Entry Grant** (By Security)

- Security grants entry after verification
- System creates a `VisitorEntry` record
- Entry is marked with `entered_at` timestamp
- Token status: `ACTIVE` (visitor on premises)

### 4. **Visitor Exit** (By Security)

- Security logs visitor out
- System updates entry with `exited_at` timestamp
- Calculates total visit duration
- Token status: `COMPLETED`

---

## ❓ Common Scenarios

### Scenario 1: **Token Expires Without Being Used**

**What happens:**

- Token remains in database with status: `EXPIRED`
- No entry was created (since visitor never came)
- Token cannot be used to gain entry

**Where it appears:**

- ✅ **For Resident**: Shows in "My Tokens" as expired/unused
- ✅ **For Security**: Shows in reports as expired
- ❌ **NOT in Active Visitors**: No entry was made

**Why this is good:**

- Security knows the token was generated but not used
- Resident can see their token history
- No false "active" visitors

---

### Scenario 2: **Token Expires While Visitor is Still Inside**

**Current Issue (Before Fix):**

- Visitor entered with valid token
- Token expired while visitor was inside
- Status showed as `ACTIVE` but token is expired
- Security couldn't easily identify this problem

**Solution Implemented:**

- Backend now distinguishes between:
  - **ACTIVE**: Visitor inside + Token valid ✅
  - **EXPIRED_ACTIVE**: Visitor inside + Token expired ⚠️
  - **COMPLETED**: Visitor exited ✅

**Where it appears:**

- ⚠️ **Security Dashboard**: Special alert section for expired-active visitors
- 📊 **Reports**: Filtered separately
- 📞 **Action Needed**: Security can contact the host

**Status Logic:**

```javascript
if (exited_at) {
  status = "COMPLETED";
} else if (token.isExpired() && !exited_at) {
  status = "EXPIRED"; // Still inside but token expired!
} else {
  status = "ACTIVE"; // Properly active
}
```

---

## 🛡️ Security Dashboard Features

### **1. Total Tokens Card**

- Shows **all-time** token count
- ~~Removed "View All Tokens" button~~ (now use filters)
- Clean display of statistics

### **2. Active Visitors Card**

- Shows **current visitors on premises**
- Count of active entries (not exited)
- Quick glance at who's inside

### **3. Active Visitors Button**

- Opens modal with full list
- Shows:
  - Visitor name & phone
  - Host name & phone
  - House number
  - Entry time
  - Token expiry time
  - Security guard who granted entry
- **Can log visitors out** directly from modal

### **4. Report Screen with Filters**

**Date Filters:**

- 📅 **Today**: Entries from today
- 📅 **This Week**: Last 7 days
- 📅 **This Month**: Last 30 days
- 📅 **All Time**: Everything
- 📅 **Custom Range**: Pick start and end dates

**Status Filters:**

- 🟢 **Active**: Currently on premises
- ⚪ **Inactive/Completed**: Already exited
- 🟠 **Expired**: (If shown) Token expired

**Search:**

- Search by visitor name
- Search by resident name
- Search by house number
- Search by token ID

---

## 📱 Token Detail Modal

When you click any token entry (active or inactive), you see:

### **Visitor Information**

- 👤 Visitor Name
- 📞 Visitor Phone Number

### **Host Information**

- 👨‍💼 Resident Name
- 📞 Resident Phone Number
- 🏠 House Number
- 📍 Full Address

### **Visit Details**

- 🕐 Entry Time
- 🕐 Exit Time (or "Still on premises")
- ⏱️ Total Duration
- 📅 Token Expiry Time

### **Security Information**

- 🛡️ Guard who verified entry
- 📝 Additional notes

### **Status Badge**

- 🟢 Active
- ⚪ Completed
- 🟠 Expired

---

## 🔔 Key Benefits

### For Residents:

- See all their generated tokens
- Track visitor history
- Know if token was used or expired

### For Security:

- Quick verification via QR scan
- Easy checkout process
- Identify expired tokens still active
- Filter by date to see today's entries
- Full visitor details at a glance

### For Admins:

- Monitor all visitor traffic
- Generate reports
- Identify security concerns
- Track entry/exit patterns

---

## 🎯 Best Practices

1. **Generate tokens close to visit time**

   - Avoid generating tokens too far in advance
   - Reduces expired-unused tokens

2. **Security should log out visitors**

   - Always mark exit when visitor leaves
   - Keeps active count accurate

3. **Regular monitoring**

   - Check for expired-active visitors
   - Contact hosts if visitor overstays

4. **Use appropriate visit types**
   - Short visits for quick errands
   - Long visits for extended stays
   - This sets appropriate expiry times

---

## 📊 Status Reference Table

| Status             | Description                   | Visitor Inside? | Token Valid? | Action Needed          |
| ------------------ | ----------------------------- | --------------- | ------------ | ---------------------- |
| **PENDING**        | Generated, not used           | ❌ No           | ✅ Yes       | Wait for visitor       |
| **ACTIVE**         | Visitor on premises           | ✅ Yes          | ✅ Yes       | Normal visit           |
| **EXPIRED**        | Token expired, unused         | ❌ No           | ❌ No        | None (history)         |
| **EXPIRED_ACTIVE** | Visitor inside, token expired | ✅ Yes          | ❌ No        | Contact host/Check out |
| **COMPLETED**      | Visit finished                | ❌ No           | ⏸️ N/A       | None (history)         |

---

## 🔧 Technical Implementation

**Files Updated:**

1. `SecDashboard.jsx` - Improved cards and layout
2. `ReportScreen.jsx` (Security) - Added filters and detail modal
3. `TokenDetailModal.jsx` - New comprehensive modal
4. `VisitorsScreen.jsx` - Enhanced with detail modal
5. `ActiveTokensModal.jsx` - Enhanced checkout functionality

**Backend Endpoints Used:**

- `GET /api/visitor-tokens/all-entries` - All token history
- `GET /api/visitor-tokens/active-entries` - Currently active visitors
- `GET /api/visitor-tokens/my-entries` - User's own tokens
- `POST /api/visitor-tokens/verify` - Verify token
- `POST /api/visitor-tokens/grant-entry` - Grant visitor entry
- `POST /api/visitor-tokens/checkout` - Log visitor out

---

## ✨ Summary

Your visitor token system now provides:

- ✅ Clear status tracking throughout visitor lifecycle
- ✅ Separate handling of expired tokens
- ✅ Date-based filtering for reports
- ✅ Comprehensive details for each entry
- ✅ Easy checkout from active visitors modal
- ✅ Full contact information for both visitor and host
- ✅ Better security monitoring and control

This ensures security personnel can efficiently manage visitor access while residents have full visibility of their visitor history! 🎉
