-- Add house_type column to users table if it doesn't exist
ALTER TABLE `users` ADD COLUMN `house_type` ENUM('room_self', 'room_and_parlor', '2_bedroom', '3_bedroom', 'duplex') DEFAULT NULL AFTER `house_id`;

-- Add email_verified_at column if it doesn't exist
ALTER TABLE `users` ADD COLUMN `email_verified_at` TIMESTAMP NULL DEFAULT NULL AFTER `email`;
