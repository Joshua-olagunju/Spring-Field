-- ===========================
-- SPRINGFIELD ESTATE DATABASE SCHEMA
-- ===========================
-- Database: springfield_db
-- Version: 1.0.0-MVP
-- Created: November 7, 2025
-- Description: Complete database schema for Springfield Estate Management System
-- ===========================

-- Create database
CREATE DATABASE IF NOT EXISTS springfield_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE springfield_db;

-- ===========================
-- HOUSES TABLE
-- (Must be created before users due to foreign key reference)
-- ===========================
CREATE TABLE houses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    landlord_id INT NOT NULL,
    house_number VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_landlord_id (landlord_id),
    INDEX idx_house_number (house_number)
);

-- ===========================
-- USERS TABLE
-- ===========================
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
    
    -- Indexes for performance
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_house_id (house_id),
    INDEX idx_status_active (status_active),
    
    -- Foreign key constraint (will be added after houses table creation)
    FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Add foreign key constraint to houses table (referencing users for landlord_id)
ALTER TABLE houses 
ADD CONSTRAINT fk_houses_landlord 
FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ===========================
-- REGISTRATION CODES TABLE
-- (Used for Landlords & Residents)
-- ===========================
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
    
    -- Indexes for performance
    INDEX idx_code_hash (code_hash),
    INDEX idx_house_id (house_id),
    INDEX idx_issued_by (issued_by),
    INDEX idx_expires_at (expires_at),
    INDEX idx_revoked (revoked),
    
    -- Foreign key constraints
    FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (used_by_user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ===========================
-- VISITOR TOKENS TABLE
-- (Auto-links to the Landlord's address through Resident's house)
-- ===========================
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
    
    -- Indexes for performance
    INDEX idx_token_hash (token_hash),
    INDEX idx_resident_id (resident_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_visit_type (visit_type),
    INDEX idx_used_at (used_at),
    
    -- Foreign key constraint
    FOREIGN KEY (resident_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===========================
-- VISITOR ENTRIES TABLE
-- (Tracks actual entry/exit)
-- ===========================
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
    
    -- Indexes for performance
    INDEX idx_token_id (token_id),
    INDEX idx_guard_id (guard_id),
    INDEX idx_entered_at (entered_at),
    INDEX idx_exited_at (exited_at),
    INDEX idx_gate_id (gate_id),
    
    -- Foreign key constraints
    FOREIGN KEY (token_id) REFERENCES visitor_tokens(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (guard_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ===========================
-- PAYMENTS TABLE
-- (Linked to the user directly)
-- ===========================
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
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_period_type (period_type),
    INDEX idx_flutterwave_txn_id (flutterwave_txn_id),
    INDEX idx_paid_at (paid_at),
    INDEX idx_period_dates (period_start, period_end),
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===========================
-- LOGS TABLE
-- (Audit trail for every action)
-- ===========================
CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('token','payment','access','admin') NOT NULL,
    reference_id INT,
    actor_id INT,
    action VARCHAR(255),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_type (type),
    INDEX idx_reference_id (reference_id),
    INDEX idx_actor_id (actor_id),
    INDEX idx_created_at (created_at),
    INDEX idx_action (action),
    
    -- Foreign key constraint
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ===========================
-- INITIAL DATA SETUP
-- ===========================

-- Create Super Admin User (Default)
INSERT INTO users (full_name, phone, email, password_hash, role, status_active) 
VALUES (
    'System Administrator',
    '08000000000',
    'admin@springfieldestate.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 'admin123' (hashed)
    'super',
    TRUE
);

-- ===========================
-- USEFUL VIEWS FOR REPORTING
-- ===========================

-- View: Active Residents with House Information
CREATE VIEW active_residents_with_houses AS
SELECT 
    u.id as resident_id,
    u.full_name as resident_name,
    u.phone as resident_phone,
    u.email as resident_email,
    h.house_number,
    h.address,
    landlord.full_name as landlord_name,
    landlord.phone as landlord_phone
FROM users u
LEFT JOIN houses h ON u.house_id = h.id
LEFT JOIN users landlord ON h.landlord_id = landlord.id
WHERE u.role = 'resident' AND u.status_active = TRUE;

-- View: Active Visitor Tokens with Resident Info
CREATE VIEW active_visitor_tokens AS
SELECT 
    vt.id as token_id,
    vt.token_hash,
    vt.issued_for_name,
    vt.issued_for_phone,
    vt.visit_type,
    vt.expires_at,
    u.full_name as resident_name,
    h.house_number,
    h.address
FROM visitor_tokens vt
JOIN users u ON vt.resident_id = u.id
LEFT JOIN houses h ON u.house_id = h.id
WHERE vt.used_at IS NULL AND vt.expires_at > NOW();

-- View: Payment Summary by User
CREATE VIEW payment_summary AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.phone,
    u.role,
    COUNT(p.id) as total_payments,
    SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END) as total_paid,
    SUM(CASE WHEN p.status = 'pending' THEN p.amount ELSE 0 END) as total_pending,
    SUM(CASE WHEN p.status = 'failed' THEN p.amount ELSE 0 END) as total_failed,
    MAX(p.paid_at) as last_payment_date
FROM users u
LEFT JOIN payments p ON u.id = p.user_id
WHERE u.role IN ('resident', 'landlord')
GROUP BY u.id, u.full_name, u.phone, u.role;

-- ===========================
-- STORED PROCEDURES
-- ===========================

-- Procedure: Generate Visitor Token
DELIMITER //
CREATE PROCEDURE GenerateVisitorToken(
    IN p_resident_id INT,
    IN p_issued_for_name VARCHAR(100),
    IN p_issued_for_phone VARCHAR(20),
    IN p_visit_type VARCHAR(20),
    IN p_note TEXT,
    IN p_expires_hours INT,
    OUT p_token_hash VARCHAR(255)
)
BEGIN
    DECLARE v_token_raw VARCHAR(255);
    DECLARE v_expires_at DATETIME;
    
    -- Generate random token
    SET v_token_raw = CONCAT(
        UNIX_TIMESTAMP(), 
        '-', 
        p_resident_id, 
        '-', 
        FLOOR(RAND() * 1000000)
    );
    
    -- Hash the token
    SET p_token_hash = SHA2(v_token_raw, 256);
    
    -- Calculate expiration time
    SET v_expires_at = DATE_ADD(NOW(), INTERVAL p_expires_hours HOUR);
    
    -- Insert visitor token
    INSERT INTO visitor_tokens (
        resident_id, 
        token_hash, 
        issued_for_name, 
        issued_for_phone, 
        visit_type, 
        note, 
        expires_at
    ) VALUES (
        p_resident_id, 
        p_token_hash, 
        p_issued_for_name, 
        p_issued_for_phone, 
        p_visit_type, 
        p_note, 
        v_expires_at
    );
    
    -- Log the action
    INSERT INTO logs (type, reference_id, actor_id, action, metadata) 
    VALUES (
        'token', 
        LAST_INSERT_ID(), 
        p_resident_id, 
        'TOKEN_GENERATED', 
        JSON_OBJECT(
            'visitor_name', p_issued_for_name,
            'visit_type', p_visit_type,
            'expires_at', v_expires_at
        )
    );
END//
DELIMITER ;

-- ===========================
-- TRIGGERS FOR AUDIT LOGGING
-- ===========================

-- Trigger: Log payment status changes
DELIMITER //
CREATE TRIGGER payment_status_log 
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO logs (type, reference_id, actor_id, action, metadata)
        VALUES (
            'payment',
            NEW.id,
            NEW.user_id,
            CONCAT('PAYMENT_STATUS_CHANGED_', OLD.status, '_TO_', NEW.status),
            JSON_OBJECT(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'amount', NEW.amount,
                'flutterwave_txn_id', NEW.flutterwave_txn_id
            )
        );
    END IF;
END//
DELIMITER ;

-- Trigger: Log visitor token usage
DELIMITER //
CREATE TRIGGER visitor_token_usage_log 
AFTER UPDATE ON visitor_tokens
FOR EACH ROW
BEGIN
    IF OLD.used_at IS NULL AND NEW.used_at IS NOT NULL THEN
        INSERT INTO logs (type, reference_id, actor_id, action, metadata)
        VALUES (
            'token',
            NEW.id,
            NEW.resident_id,
            'TOKEN_USED',
            JSON_OBJECT(
                'visitor_name', NEW.issued_for_name,
                'visit_type', NEW.visit_type,
                'used_at', NEW.used_at
            )
        );
    END IF;
END//
DELIMITER ;

-- ===========================
-- INDEXES FOR OPTIMIZATION
-- ===========================

-- Composite indexes for common queries
CREATE INDEX idx_users_role_status ON users(role, status_active);
CREATE INDEX idx_visitor_tokens_resident_expires ON visitor_tokens(resident_id, expires_at);
CREATE INDEX idx_payments_user_status_period ON payments(user_id, status, period_start, period_end);
CREATE INDEX idx_logs_type_created ON logs(type, created_at);
CREATE INDEX idx_visitor_entries_token_entered ON visitor_entries(token_id, entered_at);

-- ===========================
-- SCHEMA COMPLETE
-- ===========================
-- Total Tables: 7 (users, houses, registration_codes, visitor_tokens, visitor_entries, payments, logs)
-- Total Views: 3 (active_residents_with_houses, active_visitor_tokens, payment_summary)
-- Total Procedures: 1 (GenerateVisitorToken)
-- Total Triggers: 2 (payment_status_log, visitor_token_usage_log)
-- ===========================