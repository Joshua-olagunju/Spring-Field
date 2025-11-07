# 🗄️ Springfield Estate Database Schema

This folder contains the complete database schema and related SQL files for the Springfield Estate Management System.

## 📁 Folder Structure

```
database/
├── sql/
│   ├── springfield_estate_schema.sql    # Complete database schema
│   ├── seeds/                           # Database seeding files
│   ├── migrations/                      # Laravel migration files
│   └── backups/                         # Database backup files
└── README.md                            # This file
```

## 🚀 Quick Setup

### 1. Import Complete Schema (Recommended)
```bash
# Navigate to XAMPP MySQL bin directory
cd C:\xampp\mysql\bin

# Import the complete schema
mysql -u root -p < "C:\xampp\htdocs\Spring-Field\Spring-Field\backend\database\sql\springfield_estate_schema.sql"
```

### 2. Manual Setup via phpMyAdmin
1. Open **phpMyAdmin** (http://localhost/phpmyadmin)
2. Create new database: `springfield_db`
3. Import the SQL file: `springfield_estate_schema.sql`
4. Verify all tables are created successfully

## 📊 Database Overview

### **Database Name:** `springfield_db`
**Character Set:** utf8mb4_unicode_ci

### **Core Tables (7)**
- **users** - Main user management
- **houses** - Property information
- **registration_codes** - Secure registration system
- **visitor_tokens** - Digital visitor access
- **visitor_entries** - Entry/exit tracking
- **payments** - Financial transactions
- **logs** - Complete audit trail

### **Views (3)**
- **active_residents_with_houses** - Resident-house relationships
- **active_visitor_tokens** - Current valid tokens
- **payment_summary** - Financial overview by user

### **Stored Procedures (1)**
- **GenerateVisitorToken** - Secure token generation with logging

### **Triggers (2)**
- **payment_status_log** - Auto-log payment changes
- **visitor_token_usage_log** - Auto-log token usage

## 🔧 Usage Examples

### Generate Visitor Token
```sql
CALL GenerateVisitorToken(
    1,                      -- resident_id
    'John Doe',            -- visitor name
    '08123456789',         -- visitor phone
    'short',               -- visit type
    'Delivery package',    -- note
    24,                    -- expires in 24 hours
    @token_hash            -- output token hash
);

SELECT @token_hash as generated_token;
```

### Check Active Visitors
```sql
-- Get all active visitor tokens
SELECT * FROM active_visitor_tokens;

-- Get visitors currently in the estate
SELECT 
    ve.*,
    vt.issued_for_name,
    vt.visit_type,
    u.full_name as resident_name
FROM visitor_entries ve
JOIN visitor_tokens vt ON ve.token_id = vt.id
JOIN users u ON vt.resident_id = u.id
WHERE ve.entered_at IS NOT NULL 
AND ve.exited_at IS NULL;
```

### Payment Analytics
```sql
-- Get payment summary for all users
SELECT * FROM payment_summary;

-- Get overdue payments
SELECT 
    p.*,
    u.full_name,
    u.phone
FROM payments p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'pending' 
AND p.period_end < CURDATE();
```

## 🔐 Security Features

### **Data Protection**
- Password hashing for all user accounts
- Token hashing for visitor access
- Registration code hashing
- Complete audit logging

### **Referential Integrity**
- Foreign key constraints with CASCADE/RESTRICT rules
- Proper indexing for performance
- Data validation through ENUM types

### **Access Control**
- Role-based user system (super, landlord, resident, security)
- Status-based user activation/deactivation
- Time-based token expiration

## 🚨 Important Notes

### **Default Super Admin**
```
Email: admin@springfieldestate.com
Phone: 08000000000
Password: admin123 (change immediately in production!)
```

### **Foreign Key Dependencies**
Tables must be created in this order:
1. users (initial, without house_id constraint)
2. houses
3. Add foreign key constraint to users.house_id
4. registration_codes
5. visitor_tokens
6. visitor_entries
7. payments
8. logs

### **Performance Optimization**
- All tables include proper indexing
- Composite indexes for common query patterns
- Views for complex joins
- Triggers for automatic logging

## 🔄 Maintenance Commands

### Backup Database
```bash
mysqldump -u root -p springfield_db > springfield_estate_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Clean Old Logs (Monthly)
```sql
-- Keep only last 6 months of logs
DELETE FROM logs 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);
```

### Clean Expired Tokens
```sql
-- Remove tokens expired more than 30 days ago
DELETE FROM visitor_tokens 
WHERE expires_at < DATE_SUB(NOW(), INTERVAL 30 DAY) 
AND used_at IS NULL;
```

## 📞 Support

For database-related issues:
- **Developer**: Joshua Olagunju
- **Contact**: driftech5233@gmail.com
- **Phone**: 09078363161

---
**Database Schema Version**: 1.0.0-MVP  
**Last Updated**: November 7, 2025