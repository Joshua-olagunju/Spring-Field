-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 19, 2025 at 01:07 PM
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
(22, 27, 'skipo8745@yahoo.com', '347767', '2025-11-12 14:25:36', '2025-11-12 13:25:36', 1, '2025-11-12 13:24:02', '2025-11-12 13:25:36'),
(23, 28, 'toperotimi01@gmail.com', '669185', '2025-11-12 14:28:34', '2025-11-12 13:28:34', 1, '2025-11-12 13:27:58', '2025-11-12 13:28:34'),
(24, 29, 'skibolina@gmail.com', '346505', '2025-11-12 14:30:24', '2025-11-12 13:30:24', 1, '2025-11-12 13:29:45', '2025-11-12 13:30:24'),
(25, 30, 'yungtee5333@gmail.com', '250114', '2025-11-12 14:33:32', '2025-11-12 13:33:32', 1, '2025-11-12 13:32:48', '2025-11-12 13:33:32'),
(28, 31, 'toperotimi@icloud.com', '625840', '2025-11-12 15:19:23', '2025-11-12 14:19:23', 1, '2025-11-12 14:17:15', '2025-11-12 14:19:23'),
(30, 31, 'toperotimi@icloud.com', '470735', '2025-11-12 15:21:20', '2025-11-12 14:21:20', 1, '2025-11-12 14:20:36', '2025-11-12 14:21:20'),
(35, 31, 'toperotimi@icloud.com', '783431', '2025-11-12 15:36:20', '2025-11-12 14:36:20', 1, '2025-11-12 14:35:45', '2025-11-12 14:36:20'),
(37, 31, 'toperotimi@icloud.com', '143945', '2025-11-12 15:40:36', '2025-11-12 14:40:36', 1, '2025-11-12 14:40:09', '2025-11-12 14:40:36'),
(48, 31, 'toperotimi@icloud.com', '948631', '2025-11-12 16:06:53', '2025-11-12 15:06:53', 1, '2025-11-12 15:05:05', '2025-11-12 15:06:53'),
(49, 32, 'tayorotimi5233@gmail.com', '799646', '2025-11-16 19:31:38', '2025-11-16 18:31:38', 1, '2025-11-16 18:31:01', '2025-11-16 18:31:38'),
(50, 33, 'yungtee5333@gmail.com', '251018', '2025-11-16 20:15:32', '2025-11-16 19:15:32', 1, '2025-11-16 19:14:35', '2025-11-16 19:15:32'),
(51, 34, 'toperotimi@icloud.com', '769181', '2025-11-16 20:26:08', '2025-11-16 19:26:08', 1, '2025-11-16 19:23:34', '2025-11-16 19:26:08'),
(52, 35, 'yungtee5333@gmail.com', '640411', '2025-11-18 14:16:46', '2025-11-18 13:16:46', 1, '2025-11-18 13:13:41', '2025-11-18 13:16:46'),
(53, 36, 'toperotimi@icloud.com', '787915', '2025-11-18 14:22:38', '2025-11-18 13:22:38', 1, '2025-11-18 13:21:33', '2025-11-18 13:22:38'),
(54, 37, 'toperotimi@icloud.com', '345380', '2025-11-18 14:36:20', '2025-11-18 13:36:20', 1, '2025-11-18 13:35:27', '2025-11-18 13:36:20'),
(55, 39, 'toperotimi@icloud.com', '430621', '2025-11-18 16:08:18', '2025-11-18 15:08:18', 1, '2025-11-18 15:07:51', '2025-11-18 15:08:18');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `houses`
--

INSERT INTO `houses` (`id`, `landlord_id`, `house_number`, `address`, `house_type`, `created_at`) VALUES
(8, 30, '45', 'Plot 10, Tawas Hotel, Off Sagamu road.', '3_bedroom', '2025-11-12 13:32:48'),
(9, 33, '22', 'Plot 10, Tawas Hotel, Off Sagamu road.', 'duplex', '2025-11-16 19:14:35'),
(10, 35, '34', 'Plot 10, Tawas Hotel, Off Sagamu road.', 'duplex', '2025-11-18 13:13:41');

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
(70, 'admin', 27, 27, 'USER_REGISTERED', '{\"user_role\":\"super\",\"is_first_three\":true,\"used_otp\":null,\"otp_generated_by\":null,\"house_number\":null,\"house_type\":null,\"address\":null,\"description\":\"Tope\"}', '2025-11-12 13:24:02'),
(71, 'admin', 28, 28, 'USER_REGISTERED', '{\"user_role\":\"super\",\"is_first_three\":true,\"used_otp\":null,\"otp_generated_by\":null,\"house_number\":null,\"house_type\":null,\"address\":null,\"description\":\"Tope\"}', '2025-11-12 13:27:58'),
(72, 'admin', 29, 29, 'USER_REGISTERED', '{\"user_role\":\"super\",\"is_first_three\":true,\"used_otp\":null,\"otp_generated_by\":null,\"house_number\":null,\"house_type\":null,\"address\":null,\"description\":\"Wire\"}', '2025-11-12 13:29:45'),
(73, 'access', 27, 27, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-12 13:30:49'),
(74, 'admin', 20, 27, 'LANDLORD_OTP_GENERATED', '{\"otp_code\":\"354016\",\"expires_at\":\"2025-11-12T20:31:18.000000Z\",\"generated_for\":\"landlord\",\"recipient_email\":\"yungtee5333@gmail.com\",\"recipient_name\":\"Soji\",\"description\":\"Tope\"}', '2025-11-12 13:31:26'),
(75, 'admin', 30, 30, 'USER_REGISTERED', '{\"user_role\":\"landlord\",\"is_first_three\":false,\"used_otp\":\"354016\",\"otp_generated_by\":27,\"house_number\":\"45\",\"house_type\":\"3_bedroom\",\"address\":\"Plot 10, Tawas Hotel, Off Sagamu road.\",\"description\":null}', '2025-11-12 13:32:48'),
(76, 'access', 30, 30, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1\"}', '2025-11-12 13:35:19'),
(77, 'admin', 31, 31, 'USER_REGISTERED', '{\"user_role\":\"resident\",\"is_first_three\":false,\"used_otp\":\"791464\",\"otp_generated_by\":30,\"house_number\":\"45\",\"house_type\":\"3_bedroom\",\"address\":\"Plot 10, Tawas Hotel, Off Sagamu road.\",\"description\":null}', '2025-11-12 13:37:13'),
(78, 'access', 27, 27, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-12 13:55:07'),
(79, 'access', 30, 30, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-12 13:55:41'),
(80, 'access', 30, 30, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-12 13:58:13'),
(81, 'access', 31, 31, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-12 14:00:14'),
(82, 'access', 31, 31, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-12 14:13:30'),
(83, 'access', 31, 31, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-12 14:14:21'),
(84, 'access', 31, 31, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-12 14:14:58'),
(85, 'access', 31, 31, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-12 14:15:43'),
(86, 'access', 31, 31, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-12 14:17:04'),
(87, 'access', 31, 31, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-12 14:20:25'),
(88, 'access', 31, 31, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-12 14:33:12'),
(89, 'access', 31, 31, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-12 14:34:05'),
(90, 'access', 31, 31, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-12 14:39:54'),
(91, 'access', 31, 31, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-12 14:41:10'),
(92, 'access', 31, 31, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-12 14:41:48'),
(93, 'access', 31, 31, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-12 14:45:35'),
(94, 'access', 31, 31, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-12 14:53:35'),
(95, 'access', 31, 31, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 Edg\\/142.0.0.0\"}', '2025-11-12 15:00:22'),
(96, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 Edg\\/142.0.0.0\"}', '2025-11-12 15:02:28'),
(97, 'access', 31, 31, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 Edg\\/142.0.0.0\"}', '2025-11-12 15:02:59'),
(98, 'access', 31, 31, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 Edg\\/142.0.0.0\"}', '2025-11-12 15:04:57'),
(99, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-13 22:46:47'),
(100, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-16 11:13:16'),
(101, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-16 17:00:05'),
(102, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-16 17:12:53'),
(103, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-16 17:16:10'),
(104, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-16 17:32:18'),
(105, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-16 17:33:11'),
(106, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-16 17:38:20'),
(107, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-16 17:42:02'),
(108, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-16 18:21:16'),
(109, 'admin', 23, 28, 'EMAIL_SEND_FAILED', '{\"error\":\"Connection could not be established with host \\\"firmaflowledger.com:587\\\": stream_socket_client(): Unable to connect to firmaflowledger.com:587 (A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond)\",\"recipient_email\":\"tayorotimi%233@gmail.com\"}', '2025-11-16 18:22:47'),
(110, 'admin', 23, 28, 'LANDLORD_OTP_GENERATED', '{\"otp_code\":\"085594\",\"expires_at\":\"2025-11-18T19:22:25.000000Z\",\"generated_for\":\"landlord\",\"recipient_email\":\"tayorotimi%233@gmail.com\",\"recipient_name\":\"tope\",\"description\":null}', '2025-11-16 18:22:47'),
(111, 'admin', 32, 32, 'USER_REGISTERED', '{\"user_role\":\"security\",\"is_first_three\":false,\"used_otp\":\"779068\",\"otp_generated_by\":28,\"house_number\":null,\"house_type\":null,\"address\":null,\"description\":null}', '2025-11-16 18:31:01'),
(112, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-16 18:33:10'),
(113, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-16 18:36:08'),
(114, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-16 18:36:38'),
(115, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-16 18:48:35'),
(116, 'token', 3, 28, 'TOKEN_USED', '{\"visitor_name\": \"hhhh\", \"visit_type\": \"short\", \"used_at\": \"2025-11-16 19:49:15\"}', '2025-11-16 19:49:15'),
(117, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-16 18:50:57'),
(118, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-16 18:52:03'),
(119, 'token', 4, 28, 'TOKEN_USED', '{\"visitor_name\": \"Tope\", \"visit_type\": \"short\", \"used_at\": \"2025-11-16 19:59:15\"}', '2025-11-16 19:59:15'),
(120, 'access', 27, 27, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-16 18:59:44'),
(121, 'access', 31, 31, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-16 19:00:24'),
(122, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-16 19:01:33'),
(123, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-16 19:11:19'),
(124, 'admin', 25, 28, 'LANDLORD_OTP_GENERATED', '{\"otp_code\":\"446353\",\"expires_at\":\"2025-11-17T20:11:46.000000Z\",\"generated_for\":\"landlord\",\"recipient_email\":\"toperotimi01@gmail.com\",\"recipient_name\":\"tope\",\"description\":null}', '2025-11-16 19:11:55'),
(125, 'admin', 33, 33, 'USER_REGISTERED', '{\"user_role\":\"landlord\",\"is_first_three\":false,\"used_otp\":\"446353\",\"otp_generated_by\":28,\"house_number\":\"22\",\"house_type\":\"duplex\",\"address\":\"Plot 10, Tawas Hotel, Off Sagamu road.\",\"description\":null}', '2025-11-16 19:14:35'),
(126, 'access', 33, 33, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-16 19:18:35'),
(127, 'admin', 34, 34, 'USER_REGISTERED', '{\"user_role\":\"resident\",\"is_first_three\":false,\"used_otp\":\"374343\",\"otp_generated_by\":33,\"house_number\":\"22\",\"house_type\":\"duplex\",\"address\":\"Plot 10, Tawas Hotel, Off Sagamu road.\",\"description\":null}', '2025-11-16 19:23:34'),
(128, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 13:09:53'),
(129, 'admin', 27, 28, 'LANDLORD_OTP_GENERATED', '{\"otp_code\":\"744920\",\"expires_at\":\"2025-11-19T14:12:17.000000Z\",\"generated_for\":\"landlord\",\"recipient_email\":\"yungtee5333@gmail.com\",\"recipient_name\":\"Tayo\",\"description\":\"boy\"}', '2025-11-18 13:12:24'),
(130, 'admin', 35, 35, 'USER_REGISTERED', '{\"user_role\":\"landlord\",\"is_first_three\":false,\"used_otp\":\"744920\",\"otp_generated_by\":28,\"house_number\":\"34\",\"house_type\":\"duplex\",\"address\":\"Plot 10, Tawas Hotel, Off Sagamu road.\",\"description\":null}', '2025-11-18 13:13:41'),
(131, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 13:18:36'),
(132, 'admin', 36, 36, 'USER_REGISTERED', '{\"user_role\":\"resident\",\"is_first_three\":false,\"used_otp\":\"476512\",\"otp_generated_by\":35,\"house_number\":\"34\",\"house_type\":\"duplex\",\"address\":\"Plot 10, Tawas Hotel, Off Sagamu road.\",\"description\":null}', '2025-11-18 13:21:33'),
(133, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 13:33:33'),
(134, 'admin', 37, 37, 'USER_REGISTERED', '{\"user_role\":\"resident\",\"is_first_three\":false,\"used_otp\":\"975980\",\"otp_generated_by\":35,\"house_number\":\"34\",\"house_type\":\"duplex\",\"address\":\"Plot 10, Tawas Hotel, Off Sagamu road.\",\"description\":null}', '2025-11-18 13:35:27'),
(135, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 Edg\\/142.0.0.0\"}', '2025-11-18 13:38:43'),
(136, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 13:41:44'),
(137, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 Edg\\/142.0.0.0\"}', '2025-11-18 13:42:23'),
(138, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 Edg\\/142.0.0.0\"}', '2025-11-18 14:28:10'),
(139, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 Edg\\/142.0.0.0\"}', '2025-11-18 14:28:37'),
(140, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 14:33:37'),
(141, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 14:33:56'),
(142, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-18 14:34:51'),
(143, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-18 14:48:56'),
(144, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 14:50:36'),
(145, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-18 15:03:40'),
(146, 'admin', 39, 39, 'USER_REGISTERED', '{\"user_role\":\"resident\",\"is_first_three\":false,\"used_otp\":\"974573\",\"otp_generated_by\":35,\"house_number\":\"34\",\"house_type\":\"duplex\",\"address\":\"Plot 10, Tawas Hotel, Off Sagamu road.\",\"description\":null}', '2025-11-18 15:07:51'),
(147, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 15:08:50'),
(148, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-18 15:23:20'),
(149, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 15:27:45'),
(150, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 15:34:19'),
(151, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 15:35:17'),
(152, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-18 15:49:20'),
(153, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 15:50:38'),
(154, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-18 15:51:25'),
(155, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-18 15:53:28'),
(156, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-18 15:56:14'),
(157, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 16:00:56'),
(158, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 16:07:17'),
(159, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320 Edg\\/142.0.0.0\"}', '2025-11-18 16:08:38'),
(160, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 Edg\\/142.0.0.0\"}', '2025-11-18 16:14:32'),
(161, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 Edg\\/142.0.0.0\"}', '2025-11-18 16:15:37'),
(162, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-18 16:16:46'),
(163, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 16:41:24'),
(164, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320 Edg\\/142.0.0.0\"}', '2025-11-18 16:58:45'),
(165, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 16:59:39'),
(166, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 17:12:45'),
(167, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 17:23:47'),
(168, 'access', 28, 28, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320 Edg\\/142.0.0.0\"}', '2025-11-18 17:27:40'),
(169, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 17:28:48'),
(170, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 17:49:09'),
(171, 'token', 9, 28, 'TOKEN_USED', '{\"visitor_name\": \"tayo\", \"visit_type\": \"short\", \"used_at\": \"2025-11-18 18:49:25\"}', '2025-11-18 18:49:25'),
(172, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320 Edg\\/142.0.0.0\"}', '2025-11-18 17:52:34'),
(173, 'access', 39, 39, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-18 17:53:21'),
(174, 'token', 10, 39, 'TOKEN_USED', '{\"visitor_name\": \"tope\", \"visit_type\": \"long\", \"used_at\": \"2025-11-18 18:54:26\"}', '2025-11-18 18:54:26'),
(175, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320 Edg\\/142.0.0.0\"}', '2025-11-18 17:59:46'),
(176, 'access', 39, 39, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-19 05:01:19'),
(177, 'access', 39, 39, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320\"}', '2025-11-19 05:01:46'),
(178, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (X11; Linux aarch64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 CrKey\\/1.54.250320 Edg\\/142.0.0.0\"}', '2025-11-19 05:02:25'),
(179, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-19 09:03:56'),
(180, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-19 09:09:20'),
(181, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 Edg\\/142.0.0.0\"}', '2025-11-19 09:11:02'),
(182, 'token', 11, 35, 'TOKEN_USED', '{\"visitor_name\": \"tayo\", \"visit_type\": \"short\", \"used_at\": \"2025-11-19 10:12:18\"}', '2025-11-19 10:12:18'),
(183, 'token', 12, 35, 'TOKEN_USED', '{\"visitor_name\": \"nbmn\", \"visit_type\": \"short\", \"used_at\": \"2025-11-19 10:20:56\"}', '2025-11-19 10:20:56'),
(184, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-19 09:32:08'),
(185, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-19 09:37:30'),
(186, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 Edg\\/142.0.0.0\"}', '2025-11-19 09:37:47'),
(187, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1 Edg\\/142.0.0.0\"}', '2025-11-19 09:42:25'),
(188, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 Edg\\/142.0.0.0\"}', '2025-11-19 09:42:44'),
(189, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 Edg\\/142.0.0.0\"}', '2025-11-19 10:05:31'),
(190, 'token', 13, 35, 'TOKEN_USED', '{\"visitor_name\": \"soj\", \"visit_type\": \"short\", \"used_at\": \"2025-11-19 11:15:14\"}', '2025-11-19 11:15:14'),
(191, 'token', 14, 35, 'TOKEN_USED', '{\"visitor_name\": \"daniel\", \"visit_type\": \"short\", \"used_at\": \"2025-11-19 11:18:49\"}', '2025-11-19 11:18:49'),
(192, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-19 10:20:16'),
(193, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-19 10:32:21'),
(194, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-19 10:33:37'),
(195, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit\\/605.1.15 (KHTML, like Gecko) Version\\/18.5 Mobile\\/15E148 Safari\\/604.1\"}', '2025-11-19 10:42:03'),
(196, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 Edg\\/142.0.0.0\"}', '2025-11-19 11:02:27'),
(197, 'access', 35, 35, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36 Edg\\/142.0.0.0\"}', '2025-11-19 11:03:19'),
(198, 'access', 32, 32, 'USER_LOGIN', '{\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/142.0.0.0 Safari\\/537.36\"}', '2025-11-19 11:04:06');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(2, '2014_10_12_000000_create_users_table', 1),
(3, '2014_10_12_100000_create_password_resets_table', 1),
(4, '2019_08_19_000000_create_failed_jobs_table', 1),
(5, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(6, '2025_11_10_160819_create_registration_otps_table', 1),
(7, '2025_11_12_000000_add_house_type_to_users_table', 1),
(8, '2014_10_12_000000_create_users_table', 1),
(9, '2014_10_12_100000_create_password_resets_table', 1),
(10, '2019_08_19_000000_create_failed_jobs_table', 1),
(11, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(12, '2025_11_10_160819_create_registration_otps_table', 1),
(13, '2025_11_12_000000_add_house_type_to_users_table', 1),
(14, '2025_11_16_000000_create_visitor_tokens_and_entries_tables', 1),
(15, '2025_11_16_184005_add_security_to_target_role_enum', 2),
(16, '2014_10_12_000000_create_users_table', 1),
(17, '2014_10_12_100000_create_password_resets_table', 1),
(18, '2019_08_19_000000_create_failed_jobs_table', 1),
(19, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(20, '2025_11_10_160819_create_registration_otps_table', 1),
(21, '2025_11_12_000000_add_house_type_to_users_table', 1),
(22, '2025_11_16_000000_create_visitor_tokens_and_entries_tables', 1),
(23, '2025_11_18_153925_add_landlord_id_to_users_table', 1),
(24, '2025_11_19_000000_add_temp_token_to_visitor_tokens', 3),
(25, '2025_11_19_115248_add_user_preferences_to_users_table', 3);

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
(55, 'App\\Models\\User', 27, 'auth_token', '8f389793ee56d3370444e4932b478846368cdbdfeeb50bbf0fab68dcbe5c0047', '[\"*\"]', NULL, NULL, '2025-11-12 13:25:36', '2025-11-12 13:25:36'),
(56, 'App\\Models\\User', 28, 'auth_token', 'b1cb2378b11afa27c1b2a9e3f650a9099b03a972fe1e21c15fc448d24bbfb95e', '[\"*\"]', NULL, NULL, '2025-11-12 13:28:34', '2025-11-12 13:28:34'),
(57, 'App\\Models\\User', 29, 'auth_token', '22197e2e762cf143ce01212f7bc59412feb2b12cfeb4abc6bc4f3e892ec9f675', '[\"*\"]', NULL, NULL, '2025-11-12 13:30:24', '2025-11-12 13:30:24'),
(58, 'App\\Models\\User', 27, 'auth_token', '256c321558cfab372b8de0fcb80d1e9899865f55756b7354719789efc426fea1', '[\"*\"]', '2025-11-12 13:31:18', NULL, '2025-11-12 13:30:49', '2025-11-12 13:31:18'),
(59, 'App\\Models\\User', 30, 'auth_token', '244f099d7959618af681b3003d3d43db4ba53473681a9a8e23be189f07f3570a', '[\"*\"]', NULL, NULL, '2025-11-12 13:33:32', '2025-11-12 13:33:32'),
(60, 'App\\Models\\User', 30, 'auth_token', 'b194cece05ef0c3819625359b5903a4f5d7d5f728e4edb722bbedaacd32f3607', '[\"*\"]', '2025-11-12 13:35:30', NULL, '2025-11-12 13:35:19', '2025-11-12 13:35:30'),
(61, 'App\\Models\\User', 31, 'auth_token', '6d71ebd807bec68a3d8ea5b68aaea0b3a37360460a37ba4f3fb80003ff3cef8c', '[\"*\"]', NULL, NULL, '2025-11-12 13:38:22', '2025-11-12 13:38:22'),
(62, 'App\\Models\\User', 27, 'auth_token', 'baaaba2b3bd86547b8fec32ffd19eaa85c371729a30c2c51478c80f7f834b4fd', '[\"*\"]', NULL, NULL, '2025-11-12 13:55:07', '2025-11-12 13:55:07'),
(63, 'App\\Models\\User', 30, 'auth_token', 'b729576ae4c398c0898fad7d4016cb92769a1ce8b8a482de3f2e53b329a17ca2', '[\"*\"]', NULL, NULL, '2025-11-12 13:55:41', '2025-11-12 13:55:41'),
(64, 'App\\Models\\User', 30, 'auth_token', 'bb413df4fdfa04038e477aacd039621b3c878191f8231e0010e269ee86d90295', '[\"*\"]', NULL, NULL, '2025-11-12 13:58:13', '2025-11-12 13:58:13'),
(65, 'App\\Models\\User', 31, 'auth_token', 'f0e86ec2d90ac2c971a688bf5f16400fa56626a294b2651b662442ee81bb805d', '[\"*\"]', NULL, NULL, '2025-11-12 14:00:14', '2025-11-12 14:00:14'),
(66, 'App\\Models\\User', 31, 'auth_token', 'df973e0e630ef4efe7943f26f1bf7396068039106afd4cb212926646f7e20ad3', '[\"*\"]', NULL, NULL, '2025-11-12 14:13:30', '2025-11-12 14:13:30'),
(67, 'App\\Models\\User', 31, 'auth_token', '1c65c70f3cb53e402d1d55a3141faf4bb91021d29289057c6d38dc3a8910d02e', '[\"*\"]', NULL, NULL, '2025-11-12 14:14:21', '2025-11-12 14:14:21'),
(68, 'App\\Models\\User', 31, 'auth_token', '3082eeba757db406bcd7f428cc7a7036cf16385cc8596a6f41d51234eef49798', '[\"*\"]', NULL, NULL, '2025-11-12 14:14:58', '2025-11-12 14:14:58'),
(69, 'App\\Models\\User', 31, 'auth_token', 'a14d2e23e5f597a9447f3f4c2256767d52987b6807d9f64e41c30d3ba29d8cb4', '[\"*\"]', NULL, NULL, '2025-11-12 14:15:43', '2025-11-12 14:15:43'),
(70, 'App\\Models\\User', 31, 'auth_token', '09659b3f01fdda6a2f4a2183b4368f7e216147e1071565355bc8361c52a944d9', '[\"*\"]', NULL, NULL, '2025-11-12 14:17:04', '2025-11-12 14:17:04'),
(71, 'App\\Models\\User', 31, 'auth_token', '8f02397dcdf467108d0be62e3a313ff67e27dbb8af536aefbca08ea3a3023ed5', '[\"*\"]', NULL, NULL, '2025-11-12 14:19:23', '2025-11-12 14:19:23'),
(72, 'App\\Models\\User', 31, 'auth_token', '6475fde3151fbbcb585ec14c6d31718a9d23bdcc22c8bb5fcf3802ee3d3dfc98', '[\"*\"]', NULL, NULL, '2025-11-12 14:20:25', '2025-11-12 14:20:25'),
(73, 'App\\Models\\User', 31, 'auth_token', '8a8452e04d9f59629426a5766ae2eadb9d7bbc8344f9063d203684c97e486685', '[\"*\"]', NULL, NULL, '2025-11-12 14:21:20', '2025-11-12 14:21:20'),
(74, 'App\\Models\\User', 31, 'auth_token', '3718023f90f92397e4de131d206f1e3b029db55f1b53cf41a0712dd2ab7a8f30', '[\"*\"]', NULL, NULL, '2025-11-12 14:33:12', '2025-11-12 14:33:12'),
(75, 'App\\Models\\User', 31, 'auth_token', '332f46fd53a5c2024aa93ac61aaf1a2d752786463f6bc0acb1329bb89ae9fc7f', '[\"*\"]', NULL, NULL, '2025-11-12 14:34:05', '2025-11-12 14:34:05'),
(76, 'App\\Models\\User', 31, 'auth_token', '00033321bbc04f94b528c899bf8e3c397caac14522df287a2fb3152041b877bc', '[\"*\"]', NULL, NULL, '2025-11-12 14:36:20', '2025-11-12 14:36:20'),
(77, 'App\\Models\\User', 31, 'auth_token', '39ab3c326ba359aa2599ce1a97b3dfa42517872f6722acad3886e64e2c840651', '[\"*\"]', NULL, NULL, '2025-11-12 14:39:54', '2025-11-12 14:39:54'),
(78, 'App\\Models\\User', 31, 'auth_token', '5b12d4f44df6df12fe660cf2756b87583154ed45f2b22104c9c3e2ff57c0798f', '[\"*\"]', NULL, NULL, '2025-11-12 14:40:36', '2025-11-12 14:40:36'),
(79, 'App\\Models\\User', 31, 'auth_token', 'cf9c9d253f4e409f5ab7cfbe21f3bd9a4c5081e90e14781de9f7ce37bb551e4a', '[\"*\"]', NULL, NULL, '2025-11-12 14:41:10', '2025-11-12 14:41:10'),
(80, 'App\\Models\\User', 31, 'auth_token', 'e77bd5d9a18c0b5d032548169661fb74f5469e6ad16cb2fdfaf0b2c8bd0d5bf2', '[\"*\"]', NULL, NULL, '2025-11-12 14:41:48', '2025-11-12 14:41:48'),
(81, 'App\\Models\\User', 31, 'auth_token', '63099902fc142642de4f92aa3888ffac528662319143416c188b9e6d0c93cd35', '[\"*\"]', NULL, NULL, '2025-11-12 14:45:35', '2025-11-12 14:45:35'),
(82, 'App\\Models\\User', 31, 'auth_token', '80d8e84e564b673e34e15cb50cb6e3aa3959de9e9a747a4db10971daf334ea39', '[\"*\"]', NULL, NULL, '2025-11-12 14:53:35', '2025-11-12 14:53:35'),
(83, 'App\\Models\\User', 31, 'auth_token', 'dd0553a3347cff0ad7fc537841370488a8f12321e7325f87319a734920bc8339', '[\"*\"]', NULL, NULL, '2025-11-12 15:00:22', '2025-11-12 15:00:22'),
(84, 'App\\Models\\User', 28, 'auth_token', '99ee56ea27b205b01a9a2b303993d5bac0fc0a3c5234011c8281627ea9d397d7', '[\"*\"]', NULL, NULL, '2025-11-12 15:02:28', '2025-11-12 15:02:28'),
(85, 'App\\Models\\User', 31, 'auth_token', '8f6c15318ad1e497a655dd4c87e4cf48006b3fc545bcdfa0e54468fc8d49f386', '[\"*\"]', NULL, NULL, '2025-11-12 15:02:59', '2025-11-12 15:02:59'),
(86, 'App\\Models\\User', 31, 'auth_token', '21db2760afd97875dee8ee0c4c57ed731ba159af2fc80e6409b495a7ebf23390', '[\"*\"]', '2025-11-12 19:05:32', NULL, '2025-11-12 15:04:57', '2025-11-12 19:05:32'),
(87, 'App\\Models\\User', 31, 'auth_token', '24d3e17232f7cab8776decea6f13466d8a815a10eec1ec614194c1644d1bcb08', '[\"*\"]', NULL, NULL, '2025-11-12 15:06:53', '2025-11-12 15:06:53'),
(88, 'App\\Models\\User', 28, 'auth_token', '70c31eb08f3b6faaff9412b2948bf2d526fb77efdccbc331bcedb3db5523a108', '[\"*\"]', NULL, NULL, '2025-11-13 22:46:47', '2025-11-13 22:46:47'),
(89, 'App\\Models\\User', 28, 'auth_token', 'b39dabb2a11fa6c0e6c0b3916d640e1d0316653f3121eb6155f423179cf1e450', '[\"*\"]', '2025-11-16 16:53:21', NULL, '2025-11-16 11:13:16', '2025-11-16 16:53:21'),
(90, 'App\\Models\\User', 28, 'auth_token', '5bbc0daa3a2f620f25718482407691220aad9860757371b8357ce3efaa9d3feb', '[\"*\"]', '2025-11-16 17:11:35', NULL, '2025-11-16 17:00:05', '2025-11-16 17:11:35'),
(91, 'App\\Models\\User', 28, 'auth_token', 'e66368a9246174baee1f37eededb53e3fc8ff658ef61fee88bffcfa348b90800', '[\"*\"]', '2025-11-16 17:13:12', NULL, '2025-11-16 17:12:53', '2025-11-16 17:13:12'),
(92, 'App\\Models\\User', 28, 'auth_token', '0b148496d6be414f4738fa00f8d9472a48218f46d1861780d407c623a272fb82', '[\"*\"]', '2025-11-16 17:23:07', NULL, '2025-11-16 17:16:10', '2025-11-16 17:23:07'),
(93, 'App\\Models\\User', 28, 'auth_token', 'abbba10e2cf77623066ccfb125c879897e085304232866d9609c0dca1adaab1d', '[\"*\"]', '2025-11-16 17:32:44', NULL, '2025-11-16 17:32:18', '2025-11-16 17:32:44'),
(94, 'App\\Models\\User', 28, 'auth_token', '8bd2987ab224c59346f00c70fa9073422b570bbc2e2ed977c332e8b3096eeb34', '[\"*\"]', '2025-11-16 17:33:35', NULL, '2025-11-16 17:33:11', '2025-11-16 17:33:35'),
(95, 'App\\Models\\User', 28, 'auth_token', 'f549b8a9fc2bb20309c95d032552994fecaf8bd431d90d42d87df72d850b30f4', '[\"*\"]', '2025-11-16 17:38:33', NULL, '2025-11-16 17:38:20', '2025-11-16 17:38:33'),
(96, 'App\\Models\\User', 28, 'auth_token', '3c8bbbdf8728d094da6445fbec20993c65869e244d7db7583bd90ff11c1f99eb', '[\"*\"]', '2025-11-16 17:42:13', NULL, '2025-11-16 17:42:02', '2025-11-16 17:42:13'),
(97, 'App\\Models\\User', 28, 'auth_token', '4e07c7d2bf225ce3ec501855343bcb907b3f03b321f4559a9913905906f2b21d', '[\"*\"]', '2025-11-16 18:23:23', NULL, '2025-11-16 18:21:16', '2025-11-16 18:23:23'),
(98, 'App\\Models\\User', 32, 'auth_token', 'ac9f9e438142b4b7a3469fbffea7c084f6ba6bebee572a1f00c52f2675e53cbb', '[\"*\"]', NULL, NULL, '2025-11-16 18:31:38', '2025-11-16 18:31:38'),
(99, 'App\\Models\\User', 32, 'auth_token', 'f07a2c710bc178b4058f4553ea44d663169d6419a6bc3ee4fb3931f2a0e3d130', '[\"*\"]', NULL, NULL, '2025-11-16 18:33:10', '2025-11-16 18:33:10'),
(100, 'App\\Models\\User', 32, 'auth_token', '465c6f1e6290c9096fa618e19ff46b34393dfdb58b5e0fea1795fcfe0a7c8c2e', '[\"*\"]', NULL, NULL, '2025-11-16 18:36:08', '2025-11-16 18:36:08'),
(101, 'App\\Models\\User', 28, 'auth_token', '6f24ab7106286cf8ad58fa47bdcf123255d20a59647361c30a1e3ea873482fe2', '[\"*\"]', '2025-11-16 18:36:50', NULL, '2025-11-16 18:36:38', '2025-11-16 18:36:50'),
(102, 'App\\Models\\User', 32, 'auth_token', '28167ee724094c334a5776970cd480c8ce36dde0252246df2e9c7708e085fb94', '[\"*\"]', '2025-11-16 18:49:29', NULL, '2025-11-16 18:48:35', '2025-11-16 18:49:29'),
(103, 'App\\Models\\User', 28, 'auth_token', 'ab5ebb03b380bd3d321d7dedbe4a43fb293b657544ade152a035f4addcfa05dd', '[\"*\"]', '2025-11-16 18:51:45', NULL, '2025-11-16 18:50:57', '2025-11-16 18:51:45'),
(104, 'App\\Models\\User', 32, 'auth_token', 'ccc3ebf443df73299243706681ee66db8a11fa7bfc050cb434228cf3c7251d37', '[\"*\"]', '2025-11-16 18:59:15', NULL, '2025-11-16 18:52:03', '2025-11-16 18:59:15'),
(105, 'App\\Models\\User', 27, 'auth_token', '28b0a73b05809f6e27edc9550d4a185215dfce1b1bdc639885467ea606bab60c', '[\"*\"]', NULL, NULL, '2025-11-16 18:59:44', '2025-11-16 18:59:44'),
(106, 'App\\Models\\User', 31, 'auth_token', '7691b0476368785c41585244d2cc6bc6f6e0e15328b759f2f3b9f4d757ce06f6', '[\"*\"]', '2025-11-16 19:01:13', NULL, '2025-11-16 19:00:24', '2025-11-16 19:01:13'),
(107, 'App\\Models\\User', 32, 'auth_token', 'ffcf42d88686bfcd2f7abe586d116b784e540b33eb661234929121793fdcc2aa', '[\"*\"]', '2025-11-16 19:02:29', NULL, '2025-11-16 19:01:33', '2025-11-16 19:02:29'),
(108, 'App\\Models\\User', 28, 'auth_token', 'be1206cde444839a666b0803399543ce73e961153fb0fa041ec752666cd0f5f5', '[\"*\"]', '2025-11-16 19:11:46', NULL, '2025-11-16 19:11:19', '2025-11-16 19:11:46'),
(109, 'App\\Models\\User', 33, 'auth_token', '7bc9613bb5f6d1da9a42f42b3b61b1c8f4fcbeb3f0da589e694f8be8ef6d51c5', '[\"*\"]', NULL, NULL, '2025-11-16 19:15:32', '2025-11-16 19:15:32'),
(110, 'App\\Models\\User', 33, 'auth_token', 'fad3771305d2fa8fcff2beb73dd3fc5ce88bdd7296c8646b86e25a4d84f37fbc', '[\"*\"]', '2025-11-16 19:18:45', NULL, '2025-11-16 19:18:35', '2025-11-16 19:18:45'),
(111, 'App\\Models\\User', 34, 'auth_token', '2b41d059185a285be7814a94761ca2e4e92c31eb1de5190c80f1a9d9ce205365', '[\"*\"]', NULL, NULL, '2025-11-16 19:26:08', '2025-11-16 19:26:08'),
(112, 'App\\Models\\User', 28, 'auth_token', 'c006ca051a2ab6b782c4e00e14852f2ff39d7450b1e79bfce41da22b4a903587', '[\"*\"]', '2025-11-18 13:12:17', NULL, '2025-11-18 13:09:53', '2025-11-18 13:12:17'),
(113, 'App\\Models\\User', 35, 'auth_token', '0c6ec3252bf7ab52653ca8fbe87fd83eb6cf97861c3ab4b06818d1f3c27ef479', '[\"*\"]', NULL, NULL, '2025-11-18 13:16:47', '2025-11-18 13:16:47'),
(114, 'App\\Models\\User', 35, 'auth_token', 'fbb4baa08de7bea548dcd92b1d4dcaa65b3dd54481c76ba0643d3828c3d69627', '[\"*\"]', '2025-11-18 13:19:36', NULL, '2025-11-18 13:18:36', '2025-11-18 13:19:36'),
(115, 'App\\Models\\User', 36, 'auth_token', '376fced985d2f65faf0133009226e8ec3dfb3b29f2322b8890de8d43d9233dcf', '[\"*\"]', NULL, NULL, '2025-11-18 13:22:38', '2025-11-18 13:22:38'),
(116, 'App\\Models\\User', 35, 'auth_token', 'e4548f8993086290fd4e3e6fcef36add92b8659758239c1dd71f7829601c1cd6', '[\"*\"]', '2025-11-18 13:33:56', NULL, '2025-11-18 13:33:33', '2025-11-18 13:33:56'),
(117, 'App\\Models\\User', 37, 'auth_token', '2fef133975ec8a75553f08d93c1bcf98161729a40f9759409d512fffe2713e99', '[\"*\"]', '2025-11-18 13:37:11', NULL, '2025-11-18 13:36:20', '2025-11-18 13:37:11'),
(118, 'App\\Models\\User', 32, 'auth_token', 'd35e80844bad63a6d9aca99faf7fab89e343241fe086fd3ef95bcab5fd2965d6', '[\"*\"]', '2025-11-18 13:39:02', NULL, '2025-11-18 13:38:43', '2025-11-18 13:39:02'),
(119, 'App\\Models\\User', 35, 'auth_token', '6a35296f4155aa37c694f82c1d9ed8da7816c31263bc55b432e2641bc717a3d0', '[\"*\"]', NULL, NULL, '2025-11-18 13:41:44', '2025-11-18 13:41:44'),
(120, 'App\\Models\\User', 28, 'auth_token', 'f2e16bd758ccedd6b6a35332ea13a7f069cf659e228652230600a8d571e3e3e2', '[\"*\"]', NULL, NULL, '2025-11-18 13:42:23', '2025-11-18 13:42:23'),
(121, 'App\\Models\\User', 32, 'auth_token', '221bb035ff105157d4e7890346c6329ba2b1b4b5918eb4497dfb03917453185c', '[\"*\"]', NULL, NULL, '2025-11-18 14:28:10', '2025-11-18 14:28:10'),
(122, 'App\\Models\\User', 28, 'auth_token', 'd2411a615ee8d8cb85a2e3795e764e74425ade3c3b18ac9c9b0cc4086826fcc1', '[\"*\"]', '2025-11-18 14:31:24', NULL, '2025-11-18 14:28:37', '2025-11-18 14:31:24'),
(123, 'App\\Models\\User', 32, 'auth_token', 'd0c1fbe0595835f2571adbe8b7c79654785f92737d31bf33715bd72dcb684f78', '[\"*\"]', NULL, NULL, '2025-11-18 14:33:37', '2025-11-18 14:33:37'),
(124, 'App\\Models\\User', 35, 'auth_token', '0e068362d3606bfa81408ee9499b0d914680ddfdb816ff524d5c0272186f21b4', '[\"*\"]', '2025-11-18 14:34:11', NULL, '2025-11-18 14:33:56', '2025-11-18 14:34:11'),
(125, 'App\\Models\\User', 28, 'auth_token', 'b5e17a40cfeaa86373ec09fbc9ca0faf2ab08c41704a6df6526c375ee8666a6c', '[\"*\"]', '2025-11-18 14:35:02', NULL, '2025-11-18 14:34:51', '2025-11-18 14:35:02'),
(126, 'App\\Models\\User', 27, 'test', '1dce5128fbc0b54c0c5e7769f6009cca48d67da63ba3187f72727e8c222b95c3', '[\"*\"]', '2025-11-18 14:49:03', NULL, '2025-11-18 14:45:13', '2025-11-18 14:49:03'),
(127, 'App\\Models\\User', 35, 'test', '478dc6ed462fe1b4993d729b713eb6ce9de49ab4fb7aa321b1a51316e89d78b3', '[\"*\"]', '2025-11-18 14:51:34', NULL, '2025-11-18 14:46:29', '2025-11-18 14:51:34'),
(128, 'App\\Models\\User', 28, 'auth_token', '7d9b2aa43d0a994217b102b77bbf44b75410e82e61f2065c59429fcd3be99504', '[\"*\"]', '2025-11-18 15:03:24', NULL, '2025-11-18 14:48:56', '2025-11-18 15:03:24'),
(129, 'App\\Models\\User', 35, 'auth_token', '722aa23ed19304bfbae95f4edf41d21ae6ef4e6e2f5d9c85643ac84be46aec85', '[\"*\"]', '2025-11-18 15:06:52', NULL, '2025-11-18 14:50:36', '2025-11-18 15:06:52'),
(130, 'App\\Models\\User', 27, 'test', '1f5bc7b1d7d3c4981dfd6ac534a0dcabbdebb3f5c3514acb16e3b2dae7cb0673', '[\"*\"]', NULL, NULL, '2025-11-18 14:56:55', '2025-11-18 14:56:55'),
(131, 'App\\Models\\User', 27, 'debug-token', '266703da79037fd7341fe996724ccc0142063b20d142b5010ba1878a058e3797', '[\"*\"]', NULL, NULL, '2025-11-18 14:58:43', '2025-11-18 14:58:43'),
(132, 'App\\Models\\User', 28, 'auth_token', '88497d2b947159081950c2981fc95386c22e1ba3b443249926cc4ad02cd7300d', '[\"*\"]', '2025-11-18 15:21:17', NULL, '2025-11-18 15:03:40', '2025-11-18 15:21:17'),
(133, 'App\\Models\\User', 39, 'auth_token', 'f7219ef783051cb907be04bfd5e1e4708f0053bc2926389f336f7d958612564d', '[\"*\"]', NULL, NULL, '2025-11-18 15:08:18', '2025-11-18 15:08:18'),
(134, 'App\\Models\\User', 35, 'auth_token', 'f4ea4f78ace8927287adb44650776b9e765c09928d19ae9afc93612f91b7e2bd', '[\"*\"]', '2025-11-18 15:26:05', NULL, '2025-11-18 15:08:50', '2025-11-18 15:26:05'),
(135, 'App\\Models\\User', 27, 'frontend-test', 'ca39fc82e67ace6d75ee2bfffeac6b0b77d23716da15fce3d17ee19fcc95973f', '[\"*\"]', NULL, NULL, '2025-11-18 15:11:13', '2025-11-18 15:11:13'),
(136, 'App\\Models\\User', 35, 'frontend-test', 'e43511bb39718c0b0ed11b506e019470834a63b133a1f74eec394aa4e636092e', '[\"*\"]', NULL, NULL, '2025-11-18 15:11:13', '2025-11-18 15:11:13'),
(137, 'App\\Models\\User', 27, 'api-debug', 'dd1aefd56dd791332505bf4d955b0d7a0859ea7b3901d71e4f74f18db79022cd', '[\"*\"]', '2025-11-18 15:18:20', NULL, '2025-11-18 15:18:20', '2025-11-18 15:18:20'),
(138, 'App\\Models\\User', 27, 'api-debug', '69fedd9f248b8cc4ee13c473ae86b8d618238ddedce7d5d329501c95c9def965', '[\"*\"]', '2025-11-18 15:18:41', NULL, '2025-11-18 15:18:40', '2025-11-18 15:18:41'),
(139, 'App\\Models\\User', 28, 'auth_token', '084debb385fa9a896cb61ef220033a08d7da534dfc6edf3908b828cce8e2d5b4', '[\"*\"]', '2025-11-18 15:48:04', NULL, '2025-11-18 15:23:20', '2025-11-18 15:48:04'),
(140, 'App\\Models\\User', 35, 'auth_token', 'f13d55aaadeeec2f8b0120a56824d247fd3e49bae78b655a60c9a9fd73d3b23c', '[\"*\"]', '2025-11-18 15:28:04', NULL, '2025-11-18 15:27:45', '2025-11-18 15:28:04'),
(141, 'App\\Models\\User', 35, 'auth_token', 'f6a00e1ecc3c35ce0da7bf6a888fee728d6a265e6c6106284d3865b24b7b18c3', '[\"*\"]', '2025-11-18 15:34:29', NULL, '2025-11-18 15:34:19', '2025-11-18 15:34:29'),
(142, 'App\\Models\\User', 35, 'auth_token', '004757791577c9c6ce5644312cffb4d7a0ad0959e7aaff9d4139b38b0a50af1f', '[\"*\"]', '2025-11-18 15:37:28', NULL, '2025-11-18 15:35:17', '2025-11-18 15:37:28'),
(143, 'App\\Models\\User', 28, 'auth_token', '18cfce95362e8a1f5841513c1a2991b08d06f1c77ea67e4e0b91721c49eef3eb', '[\"*\"]', '2025-11-18 15:49:58', NULL, '2025-11-18 15:49:20', '2025-11-18 15:49:58'),
(144, 'App\\Models\\User', 35, 'auth_token', 'bb35c89c5cc32b1816fcab59aa90b647691b9e9bc7ed4110797d3ccb25683e24', '[\"*\"]', '2025-11-18 15:54:29', NULL, '2025-11-18 15:50:38', '2025-11-18 15:54:29'),
(145, 'App\\Models\\User', 27, 'debug-token-1763484662', 'a9ae503d7a0dc85a79d5c15e2b182fafdaa1ccd333075d49ca7c7537d9750cfa', '[\"*\"]', NULL, NULL, '2025-11-18 15:51:02', '2025-11-18 15:51:02'),
(146, 'App\\Models\\User', 35, 'debug-token-1763484662', 'f2cc3fb5f6c8ed046f8efdf1f987d1335cd665dd6b1956c4e90ce0f8aab98fb0', '[\"*\"]', NULL, NULL, '2025-11-18 15:51:02', '2025-11-18 15:51:02'),
(147, 'App\\Models\\User', 28, 'auth_token', '1ebdfa06bed6edcf1a824f82df787d89d6cf71d6c61be59d1c6ce7a1931ef354', '[\"*\"]', '2025-11-18 15:52:39', NULL, '2025-11-18 15:51:25', '2025-11-18 15:52:39'),
(148, 'App\\Models\\User', 28, 'auth_token', '7c993b826e7bc336d58811ba69a36f69bf64e3c3968f480961aad3b47cf8e38a', '[\"*\"]', '2025-11-18 15:54:17', NULL, '2025-11-18 15:53:28', '2025-11-18 15:54:17'),
(149, 'App\\Models\\User', 28, 'auth_token', '3ac7e31b18d1c2bdf7e2c79416c9cfa530b84379a458ae327f0b8beab6608dbf', '[\"*\"]', '2025-11-18 16:07:47', NULL, '2025-11-18 15:56:14', '2025-11-18 16:07:47'),
(150, 'App\\Models\\User', 35, 'auth_token', '0b09aa2166ff7b72b53771f348e2c09852ff0171beeb6bf55f2e8953ae4d38c9', '[\"*\"]', '2025-11-18 16:05:51', NULL, '2025-11-18 16:00:56', '2025-11-18 16:05:51'),
(151, 'App\\Models\\User', 27, 'test-token', '274c62b72b5adc246e2b5b2b948f7d7cc9c63d8abc957255e8ee139616852619', '[\"*\"]', '2025-11-18 16:04:35', NULL, '2025-11-18 16:04:33', '2025-11-18 16:04:35'),
(152, 'App\\Models\\User', 27, 'test-token', 'ab5e6b35f083f080f3fa7ae32dfdea1b3e792bc60ae4d9176747d5bbd7b08fc7', '[\"*\"]', '2025-11-18 16:06:15', NULL, '2025-11-18 16:06:14', '2025-11-18 16:06:15'),
(153, 'App\\Models\\User', 35, 'auth_token', '01be4a1d988e7c00e14dca960dbeb95657a217cd8c0ccf3c4dbb498e31ef9f57', '[\"*\"]', '2025-11-18 16:10:06', NULL, '2025-11-18 16:07:17', '2025-11-18 16:10:06'),
(154, 'App\\Models\\User', 28, 'auth_token', 'b0a1b9af5660a1f766239db85e2c8c4984baabf673dc91bdd9819c85b2769e49', '[\"*\"]', '2025-11-18 16:08:53', NULL, '2025-11-18 16:08:38', '2025-11-18 16:08:53'),
(155, 'App\\Models\\User', 27, 'current-session', '0bd997073a8b3e32c54bda9bfc0ffb3f10f59d351d710df5ed903eab3d2b597e', '[\"*\"]', NULL, NULL, '2025-11-18 16:13:25', '2025-11-18 16:13:25'),
(156, 'App\\Models\\User', 35, 'current-session', 'a8f62609834b4141ca6127fe139f5b5f0f61f9d3d971e33b4ac31a70517ad0cb', '[\"*\"]', NULL, NULL, '2025-11-18 16:13:25', '2025-11-18 16:13:25'),
(157, 'App\\Models\\User', 28, 'auth_token', '969c3b6fec4641b3db110bb9a3ccf12a45f72d5f95e85bbc78bb31bc3160669e', '[\"*\"]', '2025-11-18 16:15:10', NULL, '2025-11-18 16:14:32', '2025-11-18 16:15:10'),
(158, 'App\\Models\\User', 28, 'auth_token', 'f19deacc356be0a3fd4a3aa63b8125eaae283800c95ac8645bbb38def293a644', '[\"*\"]', '2025-11-18 16:57:25', NULL, '2025-11-18 16:15:37', '2025-11-18 16:57:25'),
(159, 'App\\Models\\User', 35, 'auth_token', 'a6c8d8200b40513dc5decfb195cd5b42cbad56c4c1eede8cadace81566fbc369', '[\"*\"]', '2025-11-18 16:26:38', NULL, '2025-11-18 16:16:45', '2025-11-18 16:26:38'),
(160, 'App\\Models\\User', 35, 'auth_token', '90859da18b0957757761f5dc0f4a4cfa395da1a0533d5c62e0cfb0584d06decb', '[\"*\"]', '2025-11-18 16:56:27', NULL, '2025-11-18 16:41:24', '2025-11-18 16:56:27'),
(161, 'App\\Models\\User', 28, 'auth_token', '555ed6122412d6d3e8da8a16c5f7778f9da401e0b0b9ecc297ef2fb189e86030', '[\"*\"]', '2025-11-18 17:27:15', NULL, '2025-11-18 16:58:45', '2025-11-18 17:27:15'),
(162, 'App\\Models\\User', 35, 'auth_token', 'd02275d7c2a861095b925b291644b836f905413576716d6ba0d3aa2458fadcef', '[\"*\"]', '2025-11-18 17:00:30', NULL, '2025-11-18 16:59:39', '2025-11-18 17:00:30'),
(163, 'App\\Models\\User', 35, 'auth_token', '1db3de0a010b77d7f808b12ad31fd492ea4bcad368d28bd1694a75d5cbc9c3a1', '[\"*\"]', '2025-11-18 17:13:03', NULL, '2025-11-18 17:12:45', '2025-11-18 17:13:03'),
(164, 'App\\Models\\User', 35, 'auth_token', '13e441fb12f81a332b0cc5cda8343329410e2e876174740da80d449c5096a940', '[\"*\"]', '2025-11-18 17:26:28', NULL, '2025-11-18 17:23:47', '2025-11-18 17:26:28'),
(165, 'App\\Models\\User', 28, 'auth_token', '8fdd8c9a31784e0597a465eccf35657c1ecc4c360708cabb14b5315c1cbd373a', '[\"*\"]', '2025-11-18 17:51:44', NULL, '2025-11-18 17:27:40', '2025-11-18 17:51:44'),
(166, 'App\\Models\\User', 32, 'auth_token', '76d4e9148e92dd68f35714673302fc448ac5a576cce889480e306fafb6819af0', '[\"*\"]', '2025-11-18 17:47:42', NULL, '2025-11-18 17:28:48', '2025-11-18 17:47:42'),
(167, 'App\\Models\\User', 32, 'auth_token', '9a8d3d0ed5086db5a56b85ead5c5ae835c5babcfab686b873fe4fff15685c255', '[\"*\"]', '2025-11-18 17:52:53', NULL, '2025-11-18 17:49:09', '2025-11-18 17:52:53'),
(168, 'App\\Models\\User', 32, 'auth_token', '0ef0508442f8671e785c940b6534a54e8155d9e0d9c898b4494b44109c36b579', '[\"*\"]', '2025-11-18 17:56:10', NULL, '2025-11-18 17:52:34', '2025-11-18 17:56:10'),
(169, 'App\\Models\\User', 39, 'auth_token', 'a97b66f2071483a3964fd2b8948adaddc2a7e25fb7bee92fc0e133ff31ed1d36', '[\"*\"]', '2025-11-18 17:59:22', NULL, '2025-11-18 17:53:21', '2025-11-18 17:59:22'),
(170, 'App\\Models\\User', 32, 'auth_token', 'c9f8f622fec8762947743270a58c09d81c3cc6fa2f6eb87ece03be5a2b9af4f8', '[\"*\"]', '2025-11-18 20:20:32', NULL, '2025-11-18 17:59:46', '2025-11-18 20:20:32'),
(171, 'App\\Models\\User', 39, 'auth_token', 'b45b1a9721b1f881f9217635729bfdabbf21177f03a740512cf895441c491590', '[\"*\"]', '2025-11-19 05:01:24', NULL, '2025-11-19 05:01:19', '2025-11-19 05:01:24'),
(172, 'App\\Models\\User', 39, 'auth_token', '2885465197aa2fc23877894364f682a25ed4791b503b7211fbdb2eab6f2762ed', '[\"*\"]', '2025-11-19 05:03:36', NULL, '2025-11-19 05:01:46', '2025-11-19 05:03:36'),
(173, 'App\\Models\\User', 32, 'auth_token', '3ecb29157d55f5b312fb957d118a1f4c9a90a6843809fc6e97891ca930d37a54', '[\"*\"]', '2025-11-19 05:02:38', NULL, '2025-11-19 05:02:25', '2025-11-19 05:02:38'),
(174, 'App\\Models\\User', 35, 'auth_token', '81a592695830665816dd26c27aa33df613e63055cc1996762b4e4f9370dc0545', '[\"*\"]', '2025-11-19 09:06:53', NULL, '2025-11-19 09:03:56', '2025-11-19 09:06:53'),
(175, 'App\\Models\\User', 32, 'auth_token', '38117540e9c11e0416fe0ca3d351f85f6176360649fa161357f477d9aa33ea70', '[\"*\"]', '2025-11-19 09:21:22', NULL, '2025-11-19 09:09:20', '2025-11-19 09:21:22'),
(176, 'App\\Models\\User', 35, 'auth_token', 'aa05dda463d44baba8d43dc63e209902c0f9e27023eaaaaa07af0103366c7efd', '[\"*\"]', '2025-11-19 09:34:45', NULL, '2025-11-19 09:11:02', '2025-11-19 09:34:45'),
(177, 'App\\Models\\User', 32, 'auth_token', '87cea9f3817617a838f976b57b061f2255c669305503af63909f226b18b848c4', '[\"*\"]', '2025-11-19 09:33:01', NULL, '2025-11-19 09:32:08', '2025-11-19 09:33:01'),
(178, 'App\\Models\\User', 32, 'auth_token', '20d07bc039da292c4b919ea17831c20f04356468753fa40935fe58a73962f848', '[\"*\"]', '2025-11-19 10:20:01', NULL, '2025-11-19 09:37:30', '2025-11-19 10:20:01'),
(179, 'App\\Models\\User', 35, 'auth_token', '6e6cde7e3021e5a1d6cc9e1c3850993e3cbddbce53346f350dc98f21c8d4f51a', '[\"*\"]', '2025-11-19 09:39:13', NULL, '2025-11-19 09:37:47', '2025-11-19 09:39:13'),
(180, 'App\\Models\\User', 35, 'auth_token', '35863e5d5d2956135f38d35ab16fa31171ec8b1629f1c46e3a76960e9032502c', '[\"*\"]', '2025-11-19 09:42:29', NULL, '2025-11-19 09:42:25', '2025-11-19 09:42:29'),
(181, 'App\\Models\\User', 35, 'auth_token', '1c37e85ad4f3e4ceffde6f32ec31ce69daf210ef827a0e150bf3cb70ef075abf', '[\"*\"]', '2025-11-19 10:01:10', NULL, '2025-11-19 09:42:44', '2025-11-19 10:01:10'),
(182, 'App\\Models\\User', 35, 'auth_token', '7cddaba9e875a12355968e06fbcd4ecdc2ab99cc86c184d2642a6c66db305791', '[\"*\"]', '2025-11-19 10:59:20', NULL, '2025-11-19 10:05:31', '2025-11-19 10:59:20'),
(183, 'App\\Models\\User', 32, 'auth_token', 'e88f2d7dc58fb10c37b2e3ba164340faa158cd11a0a802bedaf4ba64225a40c7', '[\"*\"]', '2025-11-19 10:21:19', NULL, '2025-11-19 10:20:16', '2025-11-19 10:21:19'),
(184, 'App\\Models\\User', 32, 'auth_token', '4e657705332bd81e5414fc8e0bbcff16e3755c0024dded609f60f03f31ecc333', '[\"*\"]', '2025-11-19 10:32:38', NULL, '2025-11-19 10:32:21', '2025-11-19 10:32:38'),
(185, 'App\\Models\\User', 32, 'auth_token', 'bd8f6898605287e96513de6ffca97124d584dab4e0287b9ebbda036047e2ed08', '[\"*\"]', '2025-11-19 10:34:37', NULL, '2025-11-19 10:33:37', '2025-11-19 10:34:37'),
(186, 'App\\Models\\User', 32, 'auth_token', '31caad7bec74eace50790108e0cdc5952d9e2b9565ee7e854a7740dfcfd0f196', '[\"*\"]', '2025-11-19 10:58:46', NULL, '2025-11-19 10:42:03', '2025-11-19 10:58:46'),
(187, 'App\\Models\\User', 35, 'auth_token', 'a7a33fdd45cbf406f5063c5b7eb80f5b9d2b4805679b4f8198c18495f7824de0', '[\"*\"]', '2025-11-19 11:03:12', NULL, '2025-11-19 11:02:27', '2025-11-19 11:03:12'),
(188, 'App\\Models\\User', 35, 'auth_token', 'e92cfd5141161c0392c2c348843c373d2e6936d39b116366311d9834262a64e8', '[\"*\"]', '2025-11-19 11:03:39', NULL, '2025-11-19 11:03:19', '2025-11-19 11:03:39'),
(189, 'App\\Models\\User', 32, 'auth_token', '775f720c27940f7a7938288a7ed0c2dc0f40b8cbb545fd5fcfea138cd3c8a6be', '[\"*\"]', '2025-11-19 11:07:21', NULL, '2025-11-19 11:04:06', '2025-11-19 11:07:21');

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
  `target_role` enum('landlord','resident','security') NOT NULL,
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
(20, '354016', 27, 'landlord', NULL, NULL, NULL, '2025-11-12 20:31:18', '2025-11-12 14:32:48', 30, 0, '{\"recipient_email\":\"yungtee5333@gmail.com\",\"recipient_name\":\"Soji\",\"description\":\"Tope\"}', '2025-11-12 13:31:18', '2025-11-12 13:32:48'),
(21, '791464', 30, 'resident', '45', 'Plot 10, Tawas Hotel, Off Sagamu road.', 8, '2025-11-15 14:35:31', '2025-11-12 14:37:13', 31, 0, '{\"recipient_email\":\"toperotimi@icloud.com\",\"recipient_name\":\"tope\",\"generated_by_role\":\"landlord\",\"generated_by_name\":\"Temitope Rotimi\",\"admin_house_number\":\"45\",\"admin_address\":\"Plot 10, Tawas Hotel, Off Sagamu road.\",\"admin_house_type\":\"3_bedroom\"}', '2025-11-12 13:35:31', '2025-11-12 13:37:13'),
(22, '620438', 28, 'security', NULL, NULL, NULL, '2025-11-17 18:42:13', NULL, NULL, 1, '{\"recipient_email\":\"toperotimi01@gmail.com\",\"recipient_name\":\"bbhng\",\"description\":null,\"generated_by_name\":\"Temitope Rotimi\"}', '2025-11-16 17:42:13', '2025-11-16 17:42:13'),
(23, '085594', 28, 'landlord', NULL, NULL, NULL, '2025-11-18 19:22:25', NULL, NULL, 1, '{\"recipient_email\":\"tayorotimi%233@gmail.com\",\"recipient_name\":\"tope\"}', '2025-11-16 18:22:25', '2025-11-16 18:22:25'),
(24, '779068', 28, 'security', NULL, NULL, NULL, '2025-11-17 19:23:23', '2025-11-16 19:31:01', 32, 0, '{\"recipient_email\":\"tayorotimi5233@gmail.com\",\"recipient_name\":\"tope\",\"description\":null,\"generated_by_name\":\"Temitope Rotimi\"}', '2025-11-16 18:23:23', '2025-11-16 18:31:01'),
(25, '446353', 28, 'landlord', NULL, NULL, NULL, '2025-11-17 20:11:46', '2025-11-16 20:14:35', 33, 0, '{\"recipient_email\":\"toperotimi01@gmail.com\",\"recipient_name\":\"tope\"}', '2025-11-16 19:11:46', '2025-11-16 19:14:35'),
(26, '374343', 33, 'resident', '22', 'Plot 10, Tawas Hotel, Off Sagamu road.', 9, '2025-11-19 20:18:46', '2025-11-16 20:23:34', 34, 0, '{\"recipient_email\":\"toperotimi01@gmail.com\",\"recipient_name\":\"tope\",\"generated_by_role\":\"landlord\",\"generated_by_name\":\"Temitope Rotimi\",\"admin_house_number\":\"22\",\"admin_address\":\"Plot 10, Tawas Hotel, Off Sagamu road.\",\"admin_house_type\":\"duplex\"}', '2025-11-16 19:18:46', '2025-11-16 19:23:34'),
(27, '744920', 28, 'landlord', NULL, NULL, NULL, '2025-11-19 14:12:17', '2025-11-18 14:13:41', 35, 0, '{\"recipient_email\":\"yungtee5333@gmail.com\",\"recipient_name\":\"Tayo\",\"description\":\"boy\"}', '2025-11-18 13:12:17', '2025-11-18 13:13:41'),
(28, '476512', 35, 'resident', '34', 'Plot 10, Tawas Hotel, Off Sagamu road.', 10, '2025-11-21 14:19:01', '2025-11-18 14:21:33', 36, 0, '{\"recipient_email\":\"toperotimi@icloud.com\",\"recipient_name\":\"tope\",\"generated_by_role\":\"landlord\",\"generated_by_name\":\"Temitope Rotimi\",\"admin_house_number\":\"34\",\"admin_address\":\"Plot 10, Tawas Hotel, Off Sagamu road.\",\"admin_house_type\":\"duplex\"}', '2025-11-18 13:19:01', '2025-11-18 13:21:33'),
(29, '975980', 35, 'resident', '34', 'Plot 10, Tawas Hotel, Off Sagamu road.', 10, '2025-11-21 14:33:56', '2025-11-18 14:35:27', 37, 0, '{\"recipient_email\":\"toperotimi@icloud.com\",\"recipient_name\":\"tope\",\"generated_by_role\":\"landlord\",\"generated_by_name\":\"Temitope Rotimi\",\"admin_house_number\":\"34\",\"admin_address\":\"Plot 10, Tawas Hotel, Off Sagamu road.\",\"admin_house_type\":\"duplex\"}', '2025-11-18 13:33:56', '2025-11-18 13:35:27'),
(30, '250616', 35, 'resident', '34', 'Plot 10, Tawas Hotel, Off Sagamu road.', 10, '2025-11-21 15:52:04', NULL, NULL, 1, '{\"recipient_email\":\"toperotimi01@gmail.com\",\"recipient_name\":\"tope\",\"generated_by_role\":\"landlord\",\"generated_by_name\":\"Temitope Rotimi\",\"admin_house_number\":\"34\",\"admin_address\":\"Plot 10, Tawas Hotel, Off Sagamu road.\",\"admin_house_type\":\"duplex\"}', '2025-11-18 14:52:04', '2025-11-18 14:52:04'),
(31, '123456', 35, 'resident', '34', 'Plot 10, Tawas Hotel, Off Sagamu road.', NULL, '2025-11-19 16:00:25', '2025-11-18 16:03:07', 38, 0, '{\"recipient_email\":\"test@example.com\",\"recipient_name\":\"Test Resident\",\"generated_by_role\":\"landlord\",\"generated_by_name\":\"Temitope Rotimi\"}', '2025-11-18 15:00:25', '2025-11-18 15:03:07'),
(32, '974573', 35, 'resident', '34', 'Plot 10, Tawas Hotel, Off Sagamu road.', 10, '2025-11-21 16:06:52', '2025-11-18 16:07:51', 39, 0, '{\"recipient_email\":\"toperotimi@icloud.com\",\"recipient_name\":\"tope\",\"generated_by_role\":\"landlord\",\"generated_by_name\":\"Temitope Rotimi\",\"admin_house_number\":\"34\",\"admin_address\":\"Plot 10, Tawas Hotel, Off Sagamu road.\",\"admin_house_type\":\"duplex\"}', '2025-11-18 15:06:52', '2025-11-18 15:07:51'),
(33, '640329', 35, 'resident', NULL, NULL, NULL, '2025-11-19 16:18:41', NULL, NULL, 1, NULL, '2025-11-18 15:18:41', '2025-11-18 15:18:41'),
(34, '348175', 35, 'resident', NULL, NULL, NULL, '2025-11-21 16:19:14', NULL, NULL, 1, NULL, '2025-11-18 15:19:14', '2025-11-18 15:19:14'),
(35, '053361', 35, 'resident', NULL, NULL, NULL, '2025-11-21 16:25:01', NULL, NULL, 1, NULL, '2025-11-18 15:25:01', '2025-11-18 15:25:01'),
(36, '748269', 35, 'resident', '34', 'Plot 10, Tawas Hotel, Off Sagamu road.', 10, '2025-11-21 16:34:29', NULL, NULL, 1, '{\"recipient_email\":\"toperotimi01@gmail.com\",\"recipient_name\":\"tpe\",\"generated_by_role\":\"landlord\",\"generated_by_name\":\"Temitope Rotimi\",\"admin_house_number\":\"34\",\"admin_address\":\"Plot 10, Tawas Hotel, Off Sagamu road.\",\"admin_house_type\":\"duplex\"}', '2025-11-18 15:34:29', '2025-11-18 15:34:29'),
(37, '095306', 35, 'resident', NULL, NULL, NULL, '2025-11-21 17:06:14', NULL, NULL, 1, NULL, '2025-11-18 16:06:14', '2025-11-18 16:06:14'),
(38, '225459', 35, 'resident', NULL, NULL, NULL, '2025-11-21 17:06:27', NULL, NULL, 1, NULL, '2025-11-18 16:06:27', '2025-11-18 16:06:27'),
(39, '809804', 35, 'resident', '34', 'Plot 10, Tawas Hotel, Off Sagamu road.', 10, '2025-11-21 17:39:21', NULL, NULL, 1, '{\"recipient_email\":\"skibolina@gmail.com\",\"recipient_name\":\"tope\",\"generated_by_super_admin\":\"Temitope Rotimi\",\"generated_for_landlord\":\"Temitope Rotimi\",\"admin_house_number\":\"34\",\"admin_address\":\"Plot 10, Tawas Hotel, Off Sagamu road.\",\"admin_house_type\":\"duplex\"}', '2025-11-18 16:39:21', '2025-11-18 16:39:21');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `full_name` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('super','landlord','resident','security') NOT NULL,
  `house_id` int(11) DEFAULT NULL,
  `landlord_id` bigint(20) UNSIGNED DEFAULT NULL,
  `house_type` varchar(255) DEFAULT 'room_self',
  `status_active` tinyint(1) DEFAULT 1,
  `theme_preference` varchar(255) NOT NULL DEFAULT 'light',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `full_name`, `phone`, `address`, `email`, `email_verified_at`, `password_hash`, `role`, `house_id`, `landlord_id`, `house_type`, `status_active`, `theme_preference`, `created_at`, `updated_at`, `last_login_at`) VALUES
(27, NULL, NULL, 'Temitope Rotimi', '08089419709', NULL, 'skipo8745@yahoo.com', '2025-11-12 13:25:36', '$2y$10$zUsSPbwlar37Evu1tPb/Be76f1D4AKTe3kEOz9ZY47ZweAzHXLCpe', 'super', NULL, NULL, 'room_self', 1, 'light', '2025-11-12 13:24:02', '2025-11-12 13:25:36', NULL),
(28, NULL, NULL, 'Temitope Rotimi', '08089419708', NULL, 'toperotimi01@gmail.com', '2025-11-12 13:28:34', '$2y$10$6kRlN7G2mrmalJC5gjIU4.ZMrPsVf1QNU7unFZz.rGxGmacDHvjJm', 'super', NULL, NULL, 'room_self', 1, 'light', '2025-11-12 13:27:58', '2025-11-12 13:28:34', NULL),
(29, NULL, NULL, 'Temitope Rotimi', '08089419707', NULL, 'skibolina@gmail.com', '2025-11-12 13:30:24', '$2y$10$2gZBRVwDSi.5miF7Da4NV.Tj9DSYXvOjX9PR6fHf/mjYH3mSv5nVq', 'super', NULL, NULL, 'room_self', 1, 'light', '2025-11-12 13:29:45', '2025-11-12 13:30:24', NULL),
(32, NULL, NULL, 'Temitope Rotimi', '08089419712', NULL, 'tayorotimi5233@gmail.com', '2025-11-16 18:31:38', '$2y$10$3EGo5aLBHmCL.fRP1vqbQuxgYM048ognTc15gxARn6fivKNwvlcbO', 'security', NULL, NULL, 'room_self', 1, 'light', '2025-11-16 18:31:01', '2025-11-19 11:04:06', '2025-11-19 11:04:06'),
(35, NULL, NULL, 'Temitope Rotimi', '08089419744', NULL, 'yungtee5333@gmail.com', '2025-11-18 13:16:46', '$2y$10$8sdT73f7rFGq2fbdD5FJYOHwttsnMjYp22S7INjaoYQac.vwDSG.S', 'landlord', 10, NULL, 'duplex', 1, 'light', '2025-11-18 13:13:41', '2025-11-19 11:03:19', '2025-11-19 11:03:19'),
(39, NULL, NULL, 'Ojonoka Daniel', '08089419729', NULL, 'toperotimi@icloud.com', '2025-11-18 15:08:18', '$2y$10$451eaVXb8vl4v5fSjeFe.OG6CPhAlnV.2xVtZFF1tP5mFjOtmpzS2', 'resident', 10, 35, 'duplex', 1, 'light', '2025-11-18 15:07:51', '2025-11-18 16:26:23', NULL);

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

--
-- Dumping data for table `visitor_entries`
--

INSERT INTO `visitor_entries` (`id`, `token_id`, `visitor_name`, `visitor_phone`, `entered_at`, `exited_at`, `guard_id`, `gate_id`, `duration_minutes`, `note`, `created_at`) VALUES
(1, 3, 'hhhh', NULL, '2025-11-16 19:49:15', '2025-11-19 06:02:37', 32, NULL, 3493, 'Entry granted via manual input | Exit: Checked out via Active Tokens modal', '2025-11-16 18:49:15'),
(2, 4, 'Tope', '08089419708', '2025-11-16 19:59:15', '2025-11-18 18:51:33', 32, NULL, 2812, 'Entry granted via manual input | Exit: Checked out via Active Tokens modal', '2025-11-16 18:59:15'),
(3, 9, 'tayo', '08089419707', '2025-11-18 18:49:25', '2025-11-18 18:50:46', 32, NULL, 1, 'Entry granted via manual input | Exit: Checked out via manual input', '2025-11-18 17:49:25'),
(4, 10, 'tope', '08068419708', '2025-11-18 18:54:26', '2025-11-18 18:54:45', 32, NULL, 0, 'Entry granted via manual input | Exit: Checked out via manual input', '2025-11-18 17:54:26'),
(5, 11, 'tayo', '090909090900', '2025-11-19 10:12:18', '2025-11-19 10:15:10', 32, NULL, 2, 'Entry granted via manual input | Exit: Checked out via Active Tokens modal', '2025-11-19 09:12:18'),
(6, 12, 'nbmn', 'cxc', '2025-11-19 10:20:56', '2025-11-19 10:21:08', 32, NULL, 0, 'Entry granted via manual input | Exit: Checked out via Active Tokens modal', '2025-11-19 09:20:56'),
(7, 13, 'soj', '46464336434634', '2025-11-19 11:15:14', '2025-11-19 12:07:19', 32, NULL, 52, 'Entry granted via manual input | Exit: Checked out via Active Tokens modal', '2025-11-19 10:15:14'),
(8, 14, 'daniel', '786867876768', '2025-11-19 11:18:49', NULL, 32, NULL, NULL, 'Entry granted via manual input', '2025-11-19 10:18:49');

-- --------------------------------------------------------

--
-- Table structure for table `visitor_tokens`
--

CREATE TABLE `visitor_tokens` (
  `id` int(11) NOT NULL,
  `resident_id` int(11) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `temp_token` varchar(20) DEFAULT NULL,
  `issued_for_name` varchar(100) DEFAULT NULL,
  `issued_for_phone` varchar(20) DEFAULT NULL,
  `visit_type` enum('short','long','delivery','contractor','other') DEFAULT 'short',
  `note` text DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visitor_tokens`
--

INSERT INTO `visitor_tokens` (`id`, `resident_id`, `token_hash`, `temp_token`, `issued_for_name`, `issued_for_phone`, `visit_type`, `note`, `expires_at`, `used_at`, `created_at`) VALUES
(1, 28, 'ce1a01c4600b7840eb86482ba680ecec971978c0ae8a85dd807740863f143882', NULL, 'ffgfg', 'fgfg', 'short', NULL, '2025-11-16 19:16:29', NULL, '2025-11-16 17:16:29'),
(2, 28, '9e332301ecce9425d0ddc4c70f8db951341f4d46094151d092bd3f4e7d6f705a', NULL, 'tope', 'boy', 'short', NULL, '2025-11-17 00:23:07', NULL, '2025-11-16 17:23:07'),
(3, 28, 'b65a82ae883284f2abfc1cf72d401625427a5c490e17e3c1f5a2f052bf370395', NULL, 'hhhh', NULL, 'short', NULL, '2025-11-16 20:36:50', '2025-11-16 19:49:15', '2025-11-16 18:36:50'),
(4, 28, '60cba46f6f20624752080cbf00206c3e289d102a3722738baabb4e079329d0cd', NULL, 'Tope', '08089419708', 'short', 'Thanks', '2025-11-17 01:51:45', '2025-11-16 19:59:15', '2025-11-16 18:51:45'),
(5, 31, '0b1d44745829c220fc932b1435762611d0436410691988a5fcac1e4dc5f2df75', NULL, 'Tope', '08089419708', 'short', NULL, '2025-11-17 00:01:13', NULL, '2025-11-16 19:01:13'),
(6, 35, 'a3a731756f908581f4e8e1bb1a4ccda698ba7fea7b395e3bda4a7bbc486250bf', NULL, 'jhvjhvsd', 'sdbasdb', 'short', NULL, '2025-11-18 15:19:36', NULL, '2025-11-18 13:19:36'),
(7, 37, 'aed4bd6604e7aab0cd9236045da1aa8a9c24cb80d86851bf5bb4f8ca4919e091', NULL, 'tayo', '08089419708', 'short', 'boy', '2025-11-18 20:37:11', NULL, '2025-11-18 13:37:11'),
(8, 28, 'ff2d3e881cad7ac6b4525ff5c92421c4940c7e9d462d8e4e1bb522d427c2ec43', NULL, 'boy', NULL, 'short', NULL, '2025-11-18 18:15:48', NULL, '2025-11-18 16:15:48'),
(9, 28, '53d80b5c7f805379d8d54844532d8a383acd6bb104b8ff80481948bee594e966', NULL, 'tayo', '08089419707', 'short', NULL, '2025-11-18 20:48:11', '2025-11-18 18:49:25', '2025-11-18 17:48:11'),
(10, 39, 'c130f845dc48468a67208fb009b76dde992942697c847724b53bad1dd1d95e6f', NULL, 'tope', '08068419708', 'long', NULL, '2025-11-19 18:53:44', '2025-11-18 18:54:26', '2025-11-18 17:53:44'),
(11, 35, '38b58415451f00dd3870c3d7180dfc184477038ff824cc45d80d07ec21450fc9', NULL, 'tayo', '090909090900', 'short', NULL, '2025-11-19 11:11:28', '2025-11-19 10:12:18', '2025-11-19 09:11:28'),
(12, 35, '11a6874e6d54a5b27b398e5d5313ea50d7c1c1c59c0543a230e56280fb252acc', NULL, 'nbmn', 'cxc', 'short', NULL, '2025-11-19 11:20:37', '2025-11-19 10:20:56', '2025-11-19 09:20:37'),
(13, 35, '8cd73b8b7fc417ee196c1093bb0820d6a399b6dc108d76db3369f3a8fe54263a', NULL, 'soj', '46464336434634', 'short', 'dfb', '2025-11-19 11:31:45', '2025-11-19 11:15:14', '2025-11-19 09:31:45'),
(14, 35, '2113ecf1b61d028e1f7f269260271d452c444cb796497177d34f906fe9722319', NULL, 'daniel', '786867876768', 'short', NULL, '2025-11-19 12:16:15', '2025-11-19 11:18:49', '2025-11-19 10:16:15'),
(15, 35, 'ec7751b5ad640563bd8581bbb796613f8b23bc709739d79ca05077be73c31b6a', 'VT-B9OSJG8E', 'mike', '3434343434', 'short', NULL, '2025-11-19 12:17:43', NULL, '2025-11-19 10:17:43');

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `houses`
--
ALTER TABLE `houses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `logs`
--
ALTER TABLE `logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=199;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=190;

--
-- AUTO_INCREMENT for table `registration_codes`
--
ALTER TABLE `registration_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `registration_otps`
--
ALTER TABLE `registration_otps`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `visitor_entries`
--
ALTER TABLE `visitor_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `visitor_tokens`
--
ALTER TABLE `visitor_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
