-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 11, 2025 at 11:24 PM
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
-- Table structure for table `email_verifications`
--

CREATE TABLE `email_verifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `verified_at` timestamp NULL DEFAULT NULL,
  `attempts` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `email_verifications`
--

INSERT INTO `email_verifications` (`id`, `user_id`, `email`, `otp_code`, `expires_at`, `verified_at`, `attempts`, `created_at`, `updated_at`) VALUES
(11, 16, 'yungtee533@gmail.com', '317444', '2025-11-11 19:37:52', '2025-11-11 18:37:52', 1, '2025-11-11 18:36:31', '2025-11-11 18:37:52');

-- --------------------------------------------------------

--
-- Table structure for table `houses`
--

CREATE TABLE `houses` (
  `id` int(11) NOT NULL,
  `landlord_id` int(11) NOT NULL,
  `house_number` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  `house_type` varchar(50) DEFAULT 'room_self',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

--
-- Dumping data for table `houses`
--

INSERT INTO `houses` (`id`, `landlord_id`, `house_number`, `address`, `house_type`, `created_at`) VALUES
(4, 16, '10', 'NEW', 'room_self', '2025-11-11 18:36:30');

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

--
-- Dumping data for table `logs`
--

INSERT INTO `logs` (`id`, `type`, `reference_id`, `actor_id`, `action`, `metadata`, `created_at`) VALUES
(3, 'admin', 5, NULL, 'USER_REGISTERED', '{\"user_role\":\"super\",\"is_first_three\":true,\"used_otp\":null,\"otp_generated_by\":null,\"house_number\":null,\"address\":null,\"description\":\"new\"}', '2025-11-10 15:31:10'),
(4, 'admin', 6, NULL, 'USER_REGISTERED', '{\"user_role\":\"super\",\"is_first_three\":true,\"used_otp\":null,\"otp_generated_by\":null,\"house_number\":null,\"address\":null,\"description\":\"yfugu\"}', '2025-11-10 16:17:52'),
(5, 'admin', 7, NULL, 'USER_REGISTERED', '{\"user_role\":\"super\",\"is_first_three\":true,\"used_otp\":null,\"otp_generated_by\":null,\"house_number\":null,\"address\":null,\"description\":\"new\"}', '2025-11-10 19:58:28'),
(6, 'admin', 8, NULL, 'USER_REGISTERED', '{\"user_role\":\"super\",\"is_first_three\":true,\"used_otp\":null,\"otp_generated_by\":null,\"house_number\":null,\"address\":null,\"description\":\"new\"}', '2025-11-10 20:05:47'),
(7, 'admin', 9, NULL, 'USER_REGISTERED', '{\"user_role\":\"super\",\"is_first_three\":true,\"used_otp\":null,\"otp_generated_by\":null,\"house_number\":null,\"address\":null,\"description\":\"new\"}', '2025-11-10 20:10:24'),
(8, 'admin', 10, NULL, 'USER_REGISTERED', '{\"user_role\":\"super\",\"is_first_three\":true,\"used_otp\":null,\"otp_generated_by\":null,\"house_number\":null,\"address\":null,\"description\":\"new\"}', '2025-11-10 20:23:23'),
(9, 'admin', 11, 11, 'USER_REGISTERED', '{\"user_role\":\"super\",\"is_first_three\":true,\"used_otp\":null,\"otp_generated_by\":null,\"house_number\":null,\"address\":null,\"description\":\"new\"}', '2025-11-10 20:30:07'),
(10, 'access', 11, 11, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-10 20:34:51'),
(11, 'access', 11, 11, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1\"}', '2025-11-10 21:00:01'),
(12, 'admin', 12, 12, 'USER_REGISTERED', '{\"user_role\":\"super\",\"is_first_three\":true,\"used_otp\":null,\"otp_generated_by\":null,\"house_number\":null,\"address\":null,\"description\":\"new\"}', '2025-11-10 21:01:04'),
(13, 'admin', 13, NULL, 'USER_REGISTERED', '{\"user_role\":\"super\",\"is_first_three\":true,\"used_otp\":null,\"otp_generated_by\":null,\"house_number\":null,\"address\":null,\"description\":\"new\"}', '2025-11-10 21:04:48'),
(14, 'access', 11, 11, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-10 21:40:13'),
(15, 'access', 11, 11, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-11 16:52:11'),
(16, 'access', 11, 11, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-11 16:56:45'),
(17, 'admin', 14, 14, 'USER_REGISTERED', '{\"user_role\":\"super\",\"is_first_three\":true,\"used_otp\":null,\"otp_generated_by\":null,\"house_number\":null,\"address\":null,\"description\":\"new\"}', '2025-11-11 16:58:34'),
(18, 'access', 11, 11, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-11 17:03:18'),
(19, 'access', 11, 11, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-11 17:04:43'),
(20, 'admin', 1, 11, 'LANDLORD_OTP_GENERATED', '{\"otp_code\":\"JBPOHF\",\"expires_at\":\"2025-11-12T18:05:07.000000Z\",\"generated_for\":\"landlord\",\"recipient_email\":\"yungtee533@gmail.com\",\"recipient_name\":\"tayo rotimi\",\"description\":null}', '2025-11-11 17:05:14'),
(21, 'admin', 2, 11, 'LANDLORD_OTP_GENERATED', '{\"otp_code\":\"544465\",\"expires_at\":\"2025-11-12T18:09:03.000000Z\",\"generated_for\":\"landlord\",\"recipient_email\":\"yungtee533@gmail.com\",\"recipient_name\":\"TAYO ROTIMI\",\"description\":null}', '2025-11-11 17:09:08'),
(22, 'admin', 15, NULL, 'USER_REGISTERED', '{\"user_role\":\"landlord\",\"is_first_three\":false,\"used_otp\":\"544465\",\"otp_generated_by\":11,\"house_number\":null,\"address\":null,\"description\":null}', '2025-11-11 17:12:47'),
(23, 'access', 15, NULL, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-11 17:15:13'),
(24, 'access', 11, 11, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-11 18:29:38'),
(25, 'admin', 3, 11, 'LANDLORD_OTP_GENERATED', '{\"otp_code\":\"769269\",\"expires_at\":\"2025-11-12T19:29:50.000000Z\",\"generated_for\":\"landlord\",\"recipient_email\":\"yungtee533@gmail.com\",\"recipient_name\":\"rotimi\",\"description\":null}', '2025-11-11 18:29:55'),
(26, 'admin', 16, 16, 'USER_REGISTERED', '{\"user_role\":\"landlord\",\"is_first_three\":false,\"used_otp\":\"769269\",\"otp_generated_by\":11,\"house_number\":\"10\",\"house_type\":\"room_self\",\"address\":\"NEW\",\"description\":null}', '2025-11-11 18:36:31'),
(27, 'access', 16, 16, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-11 18:38:08'),
(28, 'access', 11, 11, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-11 19:31:21'),
(29, 'access', 16, 16, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-11 19:31:46'),
(30, 'admin', 4, 11, 'LANDLORD_OTP_GENERATED', '{\"otp_code\":\"837538\",\"expires_at\":\"2025-11-12T20:52:44.000000Z\",\"generated_for\":\"landlord\",\"recipient_email\":\"yungtee533@gmail.com\",\"recipient_name\":\"rotimi\",\"description\":null}', '2025-11-11 19:52:48'),
(31, 'access', 11, 11, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-11 19:53:30'),
(32, 'admin', 5, 11, 'LANDLORD_OTP_GENERATED', '{\"otp_code\":\"743822\",\"expires_at\":\"2025-11-11T21:53:54.000000Z\",\"generated_for\":\"landlord\",\"recipient_email\":\"yungtee533@gmail.com\",\"recipient_name\":\"tayo\",\"description\":null}', '2025-11-11 19:53:58'),
(33, 'access', 16, 16, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-11 19:57:45'),
(34, 'access', 16, 16, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-11 19:58:30'),
(35, 'access', 16, 16, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-11 19:59:00'),
(36, 'access', 16, 16, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-11 19:59:35'),
(37, 'admin', 6, 11, 'LANDLORD_OTP_GENERATED', '{\"otp_code\":\"030214\",\"expires_at\":\"2025-11-11T22:02:18.000000Z\",\"generated_for\":\"landlord\",\"recipient_email\":\"yungtee5333@gmail.com\",\"recipient_name\":\"boy\",\"description\":\"thanks\"}', '2025-11-11 20:02:21'),
(38, 'admin', 7, 11, 'LANDLORD_OTP_GENERATED', '{\"otp_code\":\"777042\",\"expires_at\":\"2025-11-12T03:04:12.000000Z\",\"generated_for\":\"landlord\",\"recipient_email\":\"joshuaolagunju111@gmail.com\",\"recipient_name\":\"Soji\",\"description\":\"Thanks\"}', '2025-11-11 20:04:15');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
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
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(9, 'App\\Models\\User', 11, 'auth_token', 'f2c59aeb36c673c382f6f69e65bad00f997479b3741e5560d6bbe3fa0d54a258', '[\"*\"]', NULL, NULL, '2025-11-10 20:30:34', '2025-11-10 20:30:34'),
(10, 'App\\Models\\User', 11, 'auth_token', '35ad35e0e9736ae275ebd4564b9b70b4f04e1876299a8f9af60727bdadb1f9ae', '[\"*\"]', NULL, NULL, '2025-11-10 20:34:51', '2025-11-10 20:34:51'),
(11, 'App\\Models\\User', 11, 'auth_token', '5fd4091aa112e4abce26b38be748473e55d44b6671f891a2e6d5204e3bb24f0e', '[\"*\"]', NULL, NULL, '2025-11-10 21:00:01', '2025-11-10 21:00:01'),
(12, 'App\\Models\\User', 12, 'auth_token', 'ec633cb0b69aaee13c91a1d4efe908b1dd55ee569067315319e97f40ced7574b', '[\"*\"]', NULL, NULL, '2025-11-10 21:01:25', '2025-11-10 21:01:25'),
(13, 'App\\Models\\User', 13, 'auth_token', 'd1827b559334d7cd66e47a976f58bb4b2e344c6ed52c12d5c99443765ae6d573', '[\"*\"]', NULL, NULL, '2025-11-10 21:05:15', '2025-11-10 21:05:15'),
(14, 'App\\Models\\User', 11, 'auth_token', '83db63ce302f7fa51f3147f335ccab76800fbb915a3ae517c1f9c41f38057447', '[\"*\"]', NULL, NULL, '2025-11-10 21:40:13', '2025-11-10 21:40:13'),
(15, 'App\\Models\\User', 11, 'auth_token', 'a8620d1f556c1be94bba8d5dd0094116967d36368f1a131667705e7b1e17b7a7', '[\"*\"]', NULL, NULL, '2025-11-11 16:52:11', '2025-11-11 16:52:11'),
(16, 'App\\Models\\User', 11, 'auth_token', '75f0c227831ebc3e9fa94c9e3f315b93ff12203050b8d7a7a7f75a92c14dd577', '[\"*\"]', NULL, NULL, '2025-11-11 16:56:45', '2025-11-11 16:56:45'),
(17, 'App\\Models\\User', 14, 'auth_token', 'c3bbcb82ebcd16aeb47bf2e32334bb0623fc205804e31d4cda960fb21e09eb6c', '[\"*\"]', NULL, NULL, '2025-11-11 16:59:05', '2025-11-11 16:59:05'),
(18, 'App\\Models\\User', 11, 'auth_token', 'd853dd097e22f8be01dd3f5ec72e5fffdc40a13c9b1eb743d95856ef0727ae58', '[\"*\"]', NULL, NULL, '2025-11-11 17:03:18', '2025-11-11 17:03:18'),
(19, 'App\\Models\\User', 11, 'auth_token', 'ce479efee6c265d50340de64b3c3d186d1f1781c74a499e8385145520006d40c', '[\"*\"]', '2025-11-11 17:09:03', NULL, '2025-11-11 17:04:43', '2025-11-11 17:09:03'),
(20, 'App\\Models\\User', 15, 'auth_token', 'a276f3097b2bb2c62c0d4665185bf88aef20654955b44c023a53767a7171413a', '[\"*\"]', NULL, NULL, '2025-11-11 17:13:58', '2025-11-11 17:13:58'),
(22, 'App\\Models\\User', 11, 'auth_token', 'b6fd27e3d40e66130a29a0ad2e64671bed7cf853590a6df2333018dba8b84691', '[\"*\"]', '2025-11-11 18:29:50', NULL, '2025-11-11 18:29:38', '2025-11-11 18:29:50'),
(23, 'App\\Models\\User', 16, 'auth_token', '97bc451fcf0171cd93570eac8028b97356f7f29b4708bb663f9893b207faf85d', '[\"*\"]', NULL, NULL, '2025-11-11 18:37:52', '2025-11-11 18:37:52'),
(24, 'App\\Models\\User', 16, 'auth_token', '37a5f31ff97f23503674a5b9416f00bc56f4639f012d4c020e94b5fe12b2b199', '[\"*\"]', NULL, NULL, '2025-11-11 18:38:08', '2025-11-11 18:38:08'),
(25, 'App\\Models\\User', 11, 'auth_token', 'af569ec4178c2cb72afea435f666603991bcc6ca8b70d1275f8b065ef7e55bcf', '[\"*\"]', '2025-11-11 19:52:44', NULL, '2025-11-11 19:31:21', '2025-11-11 19:52:44'),
(26, 'App\\Models\\User', 16, 'auth_token', 'c87e0bf1c1331b76d6bbca9d5dea0a61e1ac8d1c6ec48aa44f525948ca4fe0e3', '[\"*\"]', NULL, NULL, '2025-11-11 19:31:46', '2025-11-11 19:31:46'),
(27, 'App\\Models\\User', 11, 'auth_token', 'ef7c628974854d32ca0bbe89dd39ce9ed3ac6ff5dedc62d96bcdf6ec6bd0a239', '[\"*\"]', '2025-11-11 20:04:12', NULL, '2025-11-11 19:53:30', '2025-11-11 20:04:12'),
(28, 'App\\Models\\User', 16, 'auth_token', 'a271fb75acb0cad08b1b1584e5723f651603a77d60b7f152f389d58d73113a30', '[\"*\"]', NULL, NULL, '2025-11-11 19:57:45', '2025-11-11 19:57:45'),
(29, 'App\\Models\\User', 16, 'auth_token', '5a862ed1d8b387eddfdfe180dad59e238ebb48481c83cc4722a425cad6c993e2', '[\"*\"]', NULL, NULL, '2025-11-11 19:58:30', '2025-11-11 19:58:30'),
(30, 'App\\Models\\User', 16, 'auth_token', 'd7c09ecd40e13edf81ccfc932e2c3183d3573dab38949e71e5055d75b95bc09a', '[\"*\"]', NULL, NULL, '2025-11-11 19:59:00', '2025-11-11 19:59:00'),
(31, 'App\\Models\\User', 16, 'auth_token', '6014ec6a80506d9c5da286bea7756227a4d80c416909a4e048bf840eb4ddb1b5', '[\"*\"]', NULL, NULL, '2025-11-11 19:59:35', '2025-11-11 19:59:35');

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
-- Table structure for table `registration_otps`
--

CREATE TABLE `registration_otps` (
  `id` bigint(20) UNSIGNED NOT NULL,
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
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `registration_otps`
--

INSERT INTO `registration_otps` (`id`, `otp_code`, `generated_by`, `target_role`, `house_number`, `address`, `house_id`, `expires_at`, `used_at`, `used_by`, `is_active`, `metadata`, `created_at`, `updated_at`) VALUES
(2, '544465', 11, 'landlord', NULL, NULL, NULL, '2025-11-12 18:09:03', '2025-11-11 18:12:47', NULL, 0, '{\"recipient_email\":\"yungtee533@gmail.com\",\"recipient_name\":\"TAYO ROTIMI\"}', '2025-11-11 17:09:03', '2025-11-11 17:12:47'),
(3, '769269', 11, 'landlord', NULL, NULL, NULL, '2025-11-12 19:29:50', '2025-11-11 19:36:31', 16, 0, '{\"recipient_email\":\"yungtee533@gmail.com\",\"recipient_name\":\"rotimi\"}', '2025-11-11 18:29:50', '2025-11-11 18:36:31'),
(4, '837538', 11, 'landlord', NULL, NULL, NULL, '2025-11-12 20:52:44', NULL, NULL, 1, '{\"recipient_email\":\"yungtee533@gmail.com\",\"recipient_name\":\"rotimi\"}', '2025-11-11 19:52:44', '2025-11-11 19:52:44'),
(5, '743822', 11, 'landlord', NULL, NULL, NULL, '2025-11-11 21:53:54', NULL, NULL, 1, '{\"recipient_email\":\"yungtee533@gmail.com\",\"recipient_name\":\"tayo\"}', '2025-11-11 19:53:54', '2025-11-11 19:53:54'),
(6, '030214', 11, 'landlord', NULL, NULL, NULL, '2025-11-11 22:02:18', NULL, NULL, 1, '{\"recipient_email\":\"yungtee5333@gmail.com\",\"recipient_name\":\"boy\",\"description\":\"thanks\"}', '2025-11-11 20:02:18', '2025-11-11 20:02:18'),
(7, '777042', 11, 'landlord', NULL, NULL, NULL, '2025-11-12 03:04:12', NULL, NULL, 1, '{\"recipient_email\":\"joshuaolagunju111@gmail.com\",\"recipient_name\":\"Soji\",\"description\":\"Thanks\"}', '2025-11-11 20:04:12', '2025-11-11 20:04:12');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
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

INSERT INTO `users` (`id`, `full_name`, `phone`, `email`, `email_verified_at`, `password_hash`, `role`, `house_id`, `status_active`, `created_at`, `updated_at`) VALUES
(11, 'Temitayo Rotimi', '09078363161', 'yungtee5333@gmail.com', '2025-11-10 20:30:34', '$2y$10$5etgDl8Ky/ubE4F2r.v1seYgP93a21xxw5dimapM17RFAv3mb3Ovm', 'super', NULL, 1, '2025-11-10 20:30:07', '2025-11-10 20:30:34'),
(12, 'Benjamin Ndiyo', '08055672920', 'yungtee5233@gmail.com', '2025-11-10 21:01:25', '$2y$10$tbBA2TacZslNlTXZUTRjS.S4GXBhEfYqWbO8mfUhY4D9blQVBtnF2', 'super', NULL, 1, '2025-11-10 21:01:04', '2025-11-10 21:01:25'),
(14, 'Benjamin Ndiyo', '09078363162', 'yungtee51233@gmail.com', '2025-11-11 16:59:05', '$2y$10$a.hGW62iFrb6bqCaGCw8xeoNx6VPQTjebhN7nLdkVezVtphu2VHNG', 'super', NULL, 1, '2025-11-11 16:58:34', '2025-11-11 16:59:05'),
(16, 'Support Team', '09078363163', 'yungtee533@gmail.com', '2025-11-11 18:37:52', '$2y$10$oY/sLf/efRb49vcRQXb.QO8jxTZi7gUdIS1nUYc0heOyS.PUy7Lbu', 'landlord', 4, 1, '2025-11-11 18:36:30', '2025-11-11 18:37:52');

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
-- Indexes for table `email_verifications`
--
ALTER TABLE `email_verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `email_verifications_user_id_index` (`user_id`),
  ADD KEY `email_verifications_email_index` (`email`),
  ADD KEY `email_verifications_otp_code_index` (`otp_code`);

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
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

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
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

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
-- Indexes for table `registration_otps`
--
ALTER TABLE `registration_otps`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `registration_otps_otp_code_unique` (`otp_code`),
  ADD KEY `registration_otps_generated_by_foreign` (`generated_by`),
  ADD KEY `registration_otps_used_by_foreign` (`used_by`),
  ADD KEY `registration_otps_house_id_foreign` (`house_id`),
  ADD KEY `registration_otps_otp_code_is_active_index` (`otp_code`,`is_active`),
  ADD KEY `registration_otps_generated_by_target_role_index` (`generated_by`,`target_role`),
  ADD KEY `registration_otps_expires_at_index` (`expires_at`);

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `email_verifications`
--
ALTER TABLE `email_verifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `houses`
--
ALTER TABLE `houses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `logs`
--
ALTER TABLE `logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `registration_codes`
--
ALTER TABLE `registration_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `registration_otps`
--
ALTER TABLE `registration_otps`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

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
-- Constraints for table `registration_otps`
--
ALTER TABLE `registration_otps`
  ADD CONSTRAINT `registration_otps_generated_by_foreign` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `registration_otps_house_id_foreign` FOREIGN KEY (`house_id`) REFERENCES `houses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `registration_otps_used_by_foreign` FOREIGN KEY (`used_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
