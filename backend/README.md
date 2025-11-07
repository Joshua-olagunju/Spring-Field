# Springfield Estate Backend - Laravel API

Laravel PHP backend for Springfield Estate digital management system with XAMPP MySQL integration.

## 🛠️ Technology Stack

- **Framework**: Laravel 9.5.2
- **PHP Version**: 8.0.30 (XAMPP)
- **Database**: MySQL 8.0 (XAMPP)
- **Authentication**: Laravel Sanctum
- **Payment Gateway**: Flutterwave
- **Server**: Apache (XAMPP)

## 🏗️ Architecture Overview

```
Laravel Backend Architecture
├── Controllers/           # API endpoint handlers
├── Models/               # Eloquent ORM models
├── Migrations/           # Database schema
├── Routes/               # API route definitions
├── Middleware/           # Authentication & CORS
├── Services/             # Business logic
└── Config/               # Environment configuration
```

## 📋 Prerequisites

Before setting up the backend, ensure you have:

- **XAMPP** installed (PHP 8.0+, MySQL, Apache)
- **Composer** (PHP package manager)
- **Git** for version control
- **Postman** or similar for API testing

## ⚙️ Installation & Setup

### 1. XAMPP Setup
```bash
# Start XAMPP Control Panel
# Start Apache and MySQL services
# Verify MySQL is running on port 3306
```

### 2. Clone & Install Dependencies
```bash
# Navigate to project directory
cd c:\xampp\htdocs\Spring-Field\Spring-Field\backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env
```

### 3. Environment Configuration

Edit `.env` file with your settings:

```env
# Application
APP_NAME="Springfield Estate API"
APP_ENV=local
APP_KEY=base64:your_app_key_here
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# Database (XAMPP MySQL)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=spring_field_estate
DB_USERNAME=root
DB_PASSWORD=

# Flutterwave Payment Gateway
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your_public_key
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your_secret_key
FLUTTERWAVE_ENCRYPTION_KEY=your_encryption_key

# SMS & Email (Optional)
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
```

### 4. Database Setup
```bash
# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# Seed database with sample data (optional)
php artisan db:seed

# Start Laravel development server
php artisan serve
```

### 5. Verify Installation
- **API Base URL**: http://127.0.0.1:8000
- **Health Check**: http://127.0.0.1:8000/api/health
- **Database**: Access via phpMyAdmin (http://localhost/phpmyadmin)

## 🗄️ Database Schema

### Complete Database Structure

**🏠 Core Tables Overview**
```
Database Architecture Flow:
users → houses → registration_codes → visitor_tokens → visitor_entries
  ↓
payments ← logs (audit trail for all operations)
```

### **users** - Main User Management
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super','landlord','resident','security') NOT NULL,
    house_id INT,
    status_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (house_id) REFERENCES houses(id)
);
```

### **houses** - Property Management
```sql
CREATE TABLE houses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    landlord_id INT NOT NULL,
    house_number VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (landlord_id) REFERENCES users(id)
);
```

### **registration_codes** - Secure Registration System
```sql
CREATE TABLE registration_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    house_id INT NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    issued_by INT NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    used_by_user_id INT,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (house_id) REFERENCES houses(id),
    FOREIGN KEY (issued_by) REFERENCES users(id),
    FOREIGN KEY (used_by_user_id) REFERENCES users(id)
);
```

### **visitor_tokens** - Token-Based Visitor System
```sql
CREATE TABLE visitor_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    issued_for_name VARCHAR(100),
    issued_for_phone VARCHAR(20),
    visit_type ENUM('short','long','delivery','contractor','other') DEFAULT 'short',
    note TEXT,
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES users(id)
);
```

### **visitor_entries** - Entry/Exit Tracking
```sql
CREATE TABLE visitor_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token_id INT NOT NULL,
    visitor_name VARCHAR(100),
    visitor_phone VARCHAR(20),
    entered_at DATETIME,
    exited_at DATETIME,
    guard_id INT,
    gate_id INT,
    duration_minutes INT,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (token_id) REFERENCES visitor_tokens(id),
    FOREIGN KEY (guard_id) REFERENCES users(id)
);
```

### **payments** - Financial Management
```sql
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    period_type ENUM('monthly','quarterly','6months','yearly') DEFAULT 'monthly',
    period_start DATE,
    period_end DATE,
    flutterwave_txn_id VARCHAR(100),
    status ENUM('pending','paid','failed') DEFAULT 'pending',
    paid_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### **logs** - Complete Audit Trail
```sql
CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('token','payment','access','admin') NOT NULL,
    reference_id INT,
    actor_id INT,
    action VARCHAR(255),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES users(id)
);
```

## 🔄 System Logic Flow

### **1. Landlord Registration Process**
```php
// Super Admin creates landlord account
1. Super Admin → creates user (role: 'landlord')
2. Landlord → provides house details → stored in houses table
3. houses.landlord_id = user.id (automatic linking)
```

### **2. Resident Registration Process**
```php
// Secure token-based registration
1. Landlord → generates registration_codes (linked to house_id)
2. Resident → uses registration token
3. System → validates token → auto-fills users.house_id
4. registration_codes.used_at = NOW(), used_by_user_id = new_user.id
```

### **3. Visitor Token Generation**
```php
// Automatic address inheritance
1. Resident → creates visitor_tokens
2. Token → inherits resident's house_id
3. house_id → links to landlord's address (houses table)
4. Security → verifies token at gate
```

### **4. Payment Processing**
```php
// Direct user-payment relationship
1. Any user → initiates payment (payments.user_id)
2. Flutterwave → processes transaction
3. Webhook → updates payment status
4. System → logs payment activity
```

### **5. Security Gate Operations**
```php
// Complete visitor tracking
1. Guard → scans visitor token (visitor_tokens)
2. System → validates & logs entry (visitor_entries)
3. visitor_entries.entered_at = NOW()
4. On exit → visitor_entries.exited_at = NOW()
5. System → calculates duration_minutes
```

## 🔗 API Endpoints

### Authentication Endpoints
```php
POST   /api/register/verify-code       # Validate registration code
POST   /api/register/complete          # Complete user registration
POST   /api/login                      # User login (phone + password)
POST   /api/logout                     # User logout
GET    /api/user                       # Get authenticated user profile
PUT    /api/user/profile               # Update user profile
```

### House Management Endpoints
```php
POST   /api/houses                     # Create house (landlord only)
GET    /api/houses                     # List houses (role-based access)
GET    /api/houses/{id}                # Get house details
PUT    /api/houses/{id}                # Update house info
DELETE /api/houses/{id}                # Delete house (super admin)
```

### Registration Code Management
```php
POST   /api/registration-codes         # Generate registration code (landlord)
GET    /api/registration-codes         # List issued codes
POST   /api/registration-codes/verify  # Verify code validity
PUT    /api/registration-codes/{id}/revoke  # Revoke unused code
```

### Payment Endpoints
```php
POST   /api/payments/create            # Initialize Flutterwave payment
GET    /api/payments/history           # Get payment history (user-specific)
GET    /api/payments/all               # Get all payments (admin/super)
POST   /api/flutterwave/webhook        # Payment webhook (Flutterwave)
GET    /api/payments/status/{id}       # Check payment status
GET    /api/payments/overdue           # Get overdue payments
```

### Visitor Token Endpoints
```php
POST   /api/visitor-tokens             # Generate visitor token (residents)
POST   /api/visitor-tokens/verify      # Verify token at gate (security)
GET    /api/visitor-tokens             # List user's tokens
PUT    /api/visitor-tokens/{id}/revoke # Revoke unused token
GET    /api/visitor-tokens/active      # Get active tokens
```

### Visitor Entry Management
```php
POST   /api/visitor-entries            # Log visitor entry (security)
PUT    /api/visitor-entries/{id}/exit  # Log visitor exit (security)
GET    /api/visitor-entries/active     # Get current visitors
GET    /api/visitor-entries/history    # Get entry history
GET    /api/visitor-entries/today      # Today's visitor logs
GET    /api/visitor-entries/analytics  # Visitor analytics
```

### User Management (Admin/Super Admin)
```php
GET    /api/users                      # List all users
POST   /api/users                      # Create new user
GET    /api/users/{id}                 # Get user details
PUT    /api/users/{id}                 # Update user
PUT    /api/users/{id}/status          # Activate/deactivate user
DELETE /api/users/{id}                 # Delete user (super admin)
```

### Audit & Logging
```php
GET    /api/logs                       # Get system logs (admin access)
GET    /api/logs/user/{id}             # Get user-specific logs  
GET    /api/logs/payment               # Get payment logs
GET    /api/logs/visitor               # Get visitor-related logs
GET    /api/logs/access                # Get access logs
```

## 💳 Flutterwave Integration

### Payment Flow Implementation
```php
// 1. Create Payment Session
POST /api/payments/create
{
    "amount": 50000,
    "period_type": "monthly",
    "resident_id": 123
}

// 2. Flutterwave Response
{
    "checkout_url": "https://checkout.flutterwave.com/...",
    "flutterwave_ref": "FLW_REF_123456789"
}

// 3. Webhook Processing
POST /api/flutterwave/webhook
{
    "event": "charge.completed",
    "data": { /* transaction details */ }
}
```

## 🚀 Development Commands

### Database Operations
```bash
# Create new migration
php artisan make:migration create_table_name --create=table_name

# Create model with migration
php artisan make:model ModelName -m

# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Fresh migration with seeding
php artisan migrate:fresh --seed
```

### Code Generation
```bash
# Create controller
php artisan make:controller Api/ControllerName --api

# Create middleware
php artisan make:middleware MiddlewareName

# Create form request
php artisan make:request RequestName
```

## 🐛 Troubleshooting

### Common Issues

**Migration Errors**
```bash
# Check database connection
php artisan tinker
>>> DB::connection()->getPdo();

# Reset migrations
php artisan migrate:reset
php artisan migrate
```

**CORS Issues**
```bash
# Clear config cache
php artisan config:clear

# Check CORS settings
cat config/cors.php

# Verify frontend URL in .env
grep FRONTEND_URL .env
```

**Sanctum Authentication Issues**
```bash
# Publish Sanctum migrations
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Clear route cache
php artisan route:clear
```

## 📞 Support & Contact

- **Developer**: Joshua Olagunju  
- **Project Lead**: Rotimi Temitayo Daniel
- **Contact**: driftech5233@gmail.com
- **Phone**: 09078363161

---

**Backend API Documentation**  
**Version**: 1.0.0-MVP  
**Laravel Version**: 9.5.2  
**PHP Version**: 8.0.30  
**Last Updated**: November 2025
