-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 10, 2025 at 04:46 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `springfield_db`
--

-- --------------------------------------------------------

--
-- Stand-in structure for view `active_residents_with_houses`
-- (See below for the actual view)
--
CREATE TABLE `active_residents_with_houses` (
`resident_id` int(11)
,`resident_name` varchar(150)
,`resident_phone` varchar(20)
,`resident_email` varchar(100)
,`house_number` varchar(50)
,`address` varchar(255)
,`landlord_name` varchar(150)
,`landlord_phone` varchar(20)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `active_visitor_tokens`
-- (See below for the actual view)
--
CREATE TABLE `active_visitor_tokens` (
`token_id` int(11)
,`token_hash` varchar(255)
,`issued_for_name` varchar(100)
,`issued_for_phone` varchar(20)
,`visit_type` enum('short','long','delivery','contractor','other')
,`expires_at` datetime
,`resident_name` varchar(150)
,`house_number` varchar(50)
,`address` varchar(255)
);

-- --------------------------------------------------------

--
-- Table structure for table `houses`
--

CREATE TABLE `houses` (
  `id` int(11) NOT NULL,
  `landlord_id` int(11) NOT NULL,
  `house_number` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--

CREATE TABLE `logs` (
  `id` int(11) NOT NULL,
  `type` enum('token','payment','access','admin') NOT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `actor_id` int(11) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `period_type` enum('monthly','quarterly','6months','yearly') DEFAULT 'monthly',
  `period_start` date DEFAULT NULL,
  `period_end` date DEFAULT NULL,
  `flutterwave_txn_id` varchar(100) DEFAULT NULL,
  `status` enum('pending','paid','failed') DEFAULT 'pending',
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `payments`
--
DELIMITER $$
CREATE TRIGGER `payment_status_log` AFTER UPDATE ON `payments` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `payment_summary`
-- (See below for the actual view)
--
CREATE TABLE `payment_summary` (
`user_id` int(11)
,`full_name` varchar(150)
,`phone` varchar(20)
,`role` enum('super','landlord','resident','security')
,`total_payments` bigint(21)
,`total_paid` decimal(34,2)
,`total_pending` decimal(34,2)
,`total_failed` decimal(34,2)
,`last_payment_date` datetime
);

-- --------------------------------------------------------

--
-- Table structure for table `registration_codes`
--

CREATE TABLE `registration_codes` (
  `id` int(11) NOT NULL,
  `house_id` int(11) NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `issued_by` int(11) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `used_by_user_id` int(11) DEFAULT NULL,
  `revoked` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('super','landlord','resident','security') NOT NULL,
  `house_id` int(11) DEFAULT NULL,
  `status_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `phone`, `email`, `password_hash`, `role`, `house_id`, `status_active`, `created_at`, `updated_at`) VALUES
(1, 'System Administrator', '08000000000', 'admin@springfieldestate.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super', NULL, 1, '2025-11-07 15:19:35', '2025-11-07 15:19:35');

-- --------------------------------------------------------

--
-- Table structure for table `visitor_entries`
--

CREATE TABLE `visitor_entries` (
  `id` int(11) NOT NULL,
  `token_id` int(11) NOT NULL,
  `visitor_name` varchar(100) DEFAULT NULL,
  `visitor_phone` varchar(20) DEFAULT NULL,
  `entered_at` datetime DEFAULT NULL,
  `exited_at` datetime DEFAULT NULL,
  `guard_id` int(11) DEFAULT NULL,
  `gate_id` int(11) DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `visitor_tokens`
--

CREATE TABLE `visitor_tokens` (
  `id` int(11) NOT NULL,
  `resident_id` int(11) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `issued_for_name` varchar(100) DEFAULT NULL,
  `issued_for_phone` varchar(20) DEFAULT NULL,
  `visit_type` enum('short','long','delivery','contractor','other') DEFAULT 'short',
  `note` text DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `visitor_tokens`
--
DELIMITER $$
CREATE TRIGGER `visitor_token_usage_log` AFTER UPDATE ON `visitor_tokens` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `registration_otps`
--

CREATE TABLE `registration_otps` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `otp_code` varchar(10) NOT NULL,
  `generated_by` int(11) NOT NULL,
  `target_role` enum('landlord','resident') NOT NULL,
  `house_number` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `house_id` int(11) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `used_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `registration_otps_otp_code_unique` (`otp_code`),
  KEY `registration_otps_generated_by_foreign` (`generated_by`),
  KEY `registration_otps_used_by_foreign` (`used_by`),
  KEY `registration_otps_house_id_foreign` (`house_id`),
  KEY `registration_otps_otp_code_is_active_index` (`otp_code`,`is_active`),
  KEY `registration_otps_generated_by_target_role_index` (`generated_by`,`target_role`),
  KEY `registration_otps_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure for view `active_residents_with_houses`
--
DROP TABLE IF EXISTS `active_residents_with_houses`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `active_residents_with_houses`  AS SELECT `u`.`id` AS `resident_id`, `u`.`full_name` AS `resident_name`, `u`.`phone` AS `resident_phone`, `u`.`email` AS `resident_email`, `h`.`house_number` AS `house_number`, `h`.`address` AS `address`, `landlord`.`full_name` AS `landlord_name`, `landlord`.`phone` AS `landlord_phone` FROM ((`users` `u` left join `houses` `h` on(`u`.`house_id` = `h`.`id`)) left join `users` `landlord` on(`h`.`landlord_id` = `landlord`.`id`)) WHERE `u`.`role` = 'resident' AND `u`.`status_active` = 1 ;

-- --------------------------------------------------------

--
-- Structure for view `active_visitor_tokens`
--
DROP TABLE IF EXISTS `active_visitor_tokens`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `active_visitor_tokens`  AS SELECT `vt`.`id` AS `token_id`, `vt`.`token_hash` AS `token_hash`, `vt`.`issued_for_name` AS `issued_for_name`, `vt`.`issued_for_phone` AS `issued_for_phone`, `vt`.`visit_type` AS `visit_type`, `vt`.`expires_at` AS `expires_at`, `u`.`full_name` AS `resident_name`, `h`.`house_number` AS `house_number`, `h`.`address` AS `address` FROM ((`visitor_tokens` `vt` join `users` `u` on(`vt`.`resident_id` = `u`.`id`)) left join `houses` `h` on(`u`.`house_id` = `h`.`id`)) WHERE `vt`.`used_at` is null AND `vt`.`expires_at` > current_timestamp() ;

-- --------------------------------------------------------

--
-- Structure for view `payment_summary`
--
DROP TABLE IF EXISTS `payment_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `payment_summary`  AS SELECT `u`.`id` AS `user_id`, `u`.`full_name` AS `full_name`, `u`.`phone` AS `phone`, `u`.`role` AS `role`, count(`p`.`id`) AS `total_payments`, sum(case when `p`.`status` = 'paid' then `p`.`amount` else 0 end) AS `total_paid`, sum(case when `p`.`status` = 'pending' then `p`.`amount` else 0 end) AS `total_pending`, sum(case when `p`.`status` = 'failed' then `p`.`amount` else 0 end) AS `total_failed`, max(`p`.`paid_at`) AS `last_payment_date` FROM (`users` `u` left join `payments` `p` on(`u`.`id` = `p`.`user_id`)) WHERE `u`.`role` in ('resident','landlord') GROUP BY `u`.`id`, `u`.`full_name`, `u`.`phone`, `u`.`role` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `houses`
--
ALTER TABLE `houses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_landlord_id` (`landlord_id`),
  ADD KEY `idx_house_number` (`house_number`);

--
-- Indexes for table `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_reference_id` (`reference_id`),
  ADD KEY `idx_actor_id` (`actor_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_logs_type_created` (`type`,`created_at`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_period_type` (`period_type`),
  ADD KEY `idx_flutterwave_txn_id` (`flutterwave_txn_id`),
  ADD KEY `idx_paid_at` (`paid_at`),
  ADD KEY `idx_period_dates` (`period_start`,`period_end`),
  ADD KEY `idx_payments_user_status_period` (`user_id`,`status`,`period_start`,`period_end`);

--
-- Indexes for table `registration_codes`
--
ALTER TABLE `registration_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_code_hash` (`code_hash`),
  ADD KEY `idx_house_id` (`house_id`),
  ADD KEY `idx_issued_by` (`issued_by`),
  ADD KEY `idx_expires_at` (`expires_at`),
  ADD KEY `idx_revoked` (`revoked`),
  ADD KEY `used_by_user_id` (`used_by_user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_house_id` (`house_id`),
  ADD KEY `idx_status_active` (`status_active`),
  ADD KEY `idx_users_role_status` (`role`,`status_active`);

--
-- Indexes for table `visitor_entries`
--
ALTER TABLE `visitor_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_token_id` (`token_id`),
  ADD KEY `idx_guard_id` (`guard_id`),
  ADD KEY `idx_entered_at` (`entered_at`),
  ADD KEY `idx_exited_at` (`exited_at`),
  ADD KEY `idx_gate_id` (`gate_id`),
  ADD KEY `idx_visitor_entries_token_entered` (`token_id`,`entered_at`);

--
-- Indexes for table `visitor_tokens`
--
ALTER TABLE `visitor_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_token_hash` (`token_hash`),
  ADD KEY `idx_resident_id` (`resident_id`),
  ADD KEY `idx_expires_at` (`expires_at`),
  ADD KEY `idx_visit_type` (`visit_type`),
  ADD KEY `idx_used_at` (`used_at`),
  ADD KEY `idx_visitor_tokens_resident_expires` (`resident_id`,`expires_at`);

--
-- Indexes for table `personal_access_tokens`
--
-- Indexes are already defined in the table structure

--
-- Indexes for table `registration_otps`
--
-- Indexes are already defined in the table structure

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `houses`
--
ALTER TABLE `houses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `logs`
--
ALTER TABLE `logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `registration_codes`
--
ALTER TABLE `registration_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `visitor_entries`
--
ALTER TABLE `visitor_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `visitor_tokens`
--
ALTER TABLE `visitor_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint unsigned NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `registration_otps`
--
ALTER TABLE `registration_otps`
  MODIFY `id` bigint unsigned NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `houses`
--
ALTER TABLE `houses`
  ADD CONSTRAINT `fk_houses_landlord` FOREIGN KEY (`landlord_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `logs`
--
ALTER TABLE `logs`
  ADD CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `registration_codes`
--
ALTER TABLE `registration_codes`
  ADD CONSTRAINT `registration_codes_ibfk_1` FOREIGN KEY (`house_id`) REFERENCES `houses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `registration_codes_ibfk_2` FOREIGN KEY (`issued_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `registration_codes_ibfk_3` FOREIGN KEY (`used_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`house_id`) REFERENCES `houses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `visitor_entries`
--
ALTER TABLE `visitor_entries`
  ADD CONSTRAINT `visitor_entries_ibfk_1` FOREIGN KEY (`token_id`) REFERENCES `visitor_tokens` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `visitor_entries_ibfk_2` FOREIGN KEY (`guard_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `visitor_tokens`
--
ALTER TABLE `visitor_tokens`
  ADD CONSTRAINT `visitor_tokens_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `registration_otps`
--
ALTER TABLE `registration_otps`
  ADD CONSTRAINT `registration_otps_generated_by_foreign` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `registration_otps_used_by_foreign` FOREIGN KEY (`used_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `registration_otps_house_id_foreign` FOREIGN KEY (`house_id`) REFERENCES `houses` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
