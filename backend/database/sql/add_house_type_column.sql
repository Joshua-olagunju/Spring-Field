-- Add house_type column to houses table
ALTER TABLE `houses` ADD COLUMN `house_type` VARCHAR(50) DEFAULT 'room_self' AFTER `address`;

-- Add constraint to ensure valid house types
ALTER TABLE `houses` ADD CONSTRAINT `check_valid_house_type` CHECK (`house_type` IN ('room_self', 'room_and_parlor', '2_bedroom', '3_bedroom', 'duplex'));

-- Update existing records with a default value
UPDATE `houses` SET `house_type` = 'room_self' WHERE `house_type` IS NULL;
