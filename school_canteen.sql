-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 13, 2026 at 09:54 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `school_canteen`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_vendors`
--

CREATE TABLE `inventory_vendors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `quantity` decimal(15,2) NOT NULL DEFAULT 0.00,
  `unit` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menus`
--

CREATE TABLE `menus` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `vendor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Available',
  `stock` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `cooking_time` varchar(255) DEFAULT NULL,
  `ingredients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ingredients`)),
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menus`
--

INSERT INTO `menus` (`id`, `vendor_id`, `name`, `category`, `price`, `status`, `stock`, `description`, `cooking_time`, `ingredients`, `images`, `created_at`, `updated_at`) VALUES
(1, 3, 'Classic Beef Burger', 'Main Course', 85.00, 'Available', 50, 'A juicy 100% beef patty seasoned to perfection, topped with fresh lettuce, vine-ripened tomatoes, crunchy pickles, and our signature secret sauce on a toasted brioche bun.', '5-10mins', '[]', '[\"https:\\/\\/images.unsplash.com\\/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80\"]', '2026-05-19 19:59:41', '2026-05-19 20:01:18'),
(2, 3, 'Crispy Chicken Sandwich', 'Main Course', 75.00, 'Available', 30, 'Hand-breaded chicken breast fried to golden perfection, served with spicy mayo and tangy coleslaw on a soft potato roll.', NULL, NULL, '[\"https:\\/\\/images.unsplash.com\\/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=400&q=80\"]', '2026-05-19 19:59:41', '2026-05-19 19:59:41');

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
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_05_12_114326_add_role_to_users_table', 1),
(5, '2026_05_12_114621_create_personal_access_tokens_table', 1),
(6, '2026_05_15_120612_create_menu_vendors_table', 1),
(7, '2026_05_15_122754_add_ingredients_to_menu_vendors_table', 1),
(8, '2026_05_15_124601_increase_price_limit_on_menu_vendors_table', 1),
(9, '2026_05_15_124954_restore_sensible_price_limit', 1),
(10, '2026_05_15_163033_create_inventory_vendors_table', 1),
(11, '2026_05_15_163033_create_procurement_vendors_table', 1),
(12, '2026_05_15_164643_create_vendor_orders_table', 1),
(13, '2026_05_15_165646_create_orders_vendor_table', 1),
(14, '2026_05_15_165647_create_preparing_vendor_table', 1),
(15, '2026_05_15_165647_create_serving_vendor_table', 1),
(16, '2026_05_15_165648_create_served_vendor_table', 1),
(17, '2026_05_15_165907_drop_vendor_orders_table', 1),
(18, '2026_05_16_070904_add_vendor_details_to_tables', 1),
(19, '2026_05_16_070908_add_vendor_id_to_menu_vendors_table', 1),
(20, '2026_05_16_070913_add_store_name_to_users_table', 1),
(21, '2026_05_16_071110_add_profile_details_to_users_table', 1),
(22, '2026_05_16_082032_add_user_id_and_vendor_id_to_order_tables', 1),
(23, '2026_05_16_084546_add_rating_to_users_table', 1),
(24, '2026_05_16_090945_create_profile_vendors_table', 1),
(25, '2026_05_16_091248_create_user_orders_table', 1),
(26, '2026_05_16_093902_rename_profile_vendors_to_stores_table', 1),
(27, '2026_05_16_094227_rename_menu_vendors_to_menus_table', 1),
(28, '2026_05_20_031612_add_id_number_to_users_table', 1),
(29, '2026_05_20_035344_add_cooking_time_to_menus_table', 1),
(30, '2026_05_20_051000_add_cancel_reason_to_order_user_table', 2),
(31, '2026_05_20_192000_add_rating_and_comment_to_order_user_table', 3),
(32, '2026_05_20_193000_create_vendor_reviews_table', 4),
(33, '2026_05_20_201000_add_suggestion_to_reviews_and_orders_tables', 5),
(34, '2026_05_20_203500_add_payment_method_to_orders_tables', 6);

-- --------------------------------------------------------

--
-- Table structure for table `orders_vendor`
--

CREATE TABLE `orders_vendor` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `vendor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `order_number` varchar(255) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `items` text NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `payment_method` varchar(255) NOT NULL DEFAULT 'Cash',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders_vendor`
--

INSERT INTO `orders_vendor` (`id`, `user_id`, `vendor_id`, `order_number`, `customer_name`, `items`, `total_price`, `payment_method`, `created_at`, `updated_at`) VALUES
(13, 2, 3, 'ORD-6A0DAA6908CB4', 'Mark James Pisngot', '1x Crispy Chicken Sandwich (xvxcvcxv)', 75.00, 'Cash', '2026-05-20 04:34:49', '2026-05-20 04:34:49'),
(14, 2, 3, 'ORD-6A0DAADC9BF90', 'Mark James Pisngot', '1x Crispy Chicken Sandwich', 75.00, 'Cash', '2026-05-20 04:36:44', '2026-05-20 04:36:44'),
(15, 2, 3, 'ORD-6A0DAB90467D5', 'Mark James Pisngot', '1x Crispy Chicken Sandwich', 75.00, 'GCash', '2026-05-20 04:39:44', '2026-05-20 04:39:44'),
(16, 2, 3, 'ORD-6A0DB290212CA', 'Mark James Pisngot', '1x Classic Beef Burger', 85.00, 'GCash', '2026-05-20 05:09:36', '2026-05-20 05:09:36'),
(17, 2, 3, 'ORD-6A0DB3DA428BB', 'Mark James Pisngot', '1x Classic Beef Burger', 85.00, 'GCash', '2026-05-20 05:15:06', '2026-05-20 05:15:06');

-- --------------------------------------------------------

--
-- Table structure for table `order_user`
--

CREATE TABLE `order_user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `vendor_id` bigint(20) UNSIGNED NOT NULL,
  `order_number` varchar(255) NOT NULL,
  `items` text NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `payment_method` varchar(255) NOT NULL DEFAULT 'Cash',
  `status` varchar(255) NOT NULL DEFAULT 'Pending',
  `rating` tinyint(4) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `suggestion` text DEFAULT NULL,
  `cancel_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_user`
--

INSERT INTO `order_user` (`id`, `user_id`, `vendor_id`, `order_number`, `items`, `total_price`, `payment_method`, `status`, `rating`, `comment`, `suggestion`, `cancel_reason`, `created_at`, `updated_at`) VALUES
(1, 2, 3, 'ORD-6A0D3A4DA3F74', '[{\"id\":1,\"vendor_id\":3,\"name\":\"Classic Beef Burger\",\"category\":\"Main Course\",\"price\":\"85.00\",\"status\":\"Available\",\"stock\":50,\"description\":\"A juicy 100% beef patty seasoned to perfection, topped with fresh lettuce, vine-ripened tomatoes, crunchy pickles, and our signature secret sauce on a toasted brioche bun.\",\"cooking_time\":\"5-10mins\",\"ingredients\":[],\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80\"],\"created_at\":\"2026-05-20T03:59:41.000000Z\",\"updated_at\":\"2026-05-20T04:01:18.000000Z\",\"quantity\":1,\"totalPrice\":85}]', 85.00, 'Cash', 'Cancelled', NULL, NULL, NULL, NULL, '2026-05-19 20:36:29', '2026-05-19 21:00:53'),
(2, 2, 3, 'ORD-6A0D401067CFD', '[{\"id\":1,\"vendor_id\":3,\"name\":\"Classic Beef Burger\",\"category\":\"Main Course\",\"price\":\"85.00\",\"status\":\"Available\",\"stock\":50,\"description\":\"A juicy 100% beef patty seasoned to perfection, topped with fresh lettuce, vine-ripened tomatoes, crunchy pickles, and our signature secret sauce on a toasted brioche bun.\",\"cooking_time\":\"5-10mins\",\"ingredients\":[],\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80\"],\"created_at\":\"2026-05-20T03:59:41.000000Z\",\"updated_at\":\"2026-05-20T04:01:18.000000Z\",\"quantity\":1,\"totalPrice\":85}]', 85.00, 'Cash', 'Served', 5, 'Sarap', 'Damihan kanin', NULL, '2026-05-19 21:01:04', '2026-05-20 05:03:35'),
(3, 2, 3, 'ORD-6A0D41FF3EE9B', '[{\"id\":1,\"vendor_id\":3,\"name\":\"Classic Beef Burger\",\"category\":\"Main Course\",\"price\":\"85.00\",\"status\":\"Available\",\"stock\":50,\"description\":\"A juicy 100% beef patty seasoned to perfection, topped with fresh lettuce, vine-ripened tomatoes, crunchy pickles, and our signature secret sauce on a toasted brioche bun.\",\"cooking_time\":\"5-10mins\",\"ingredients\":[],\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80\"],\"created_at\":\"2026-05-20T03:59:41.000000Z\",\"updated_at\":\"2026-05-20T04:01:18.000000Z\",\"quantity\":1,\"totalPrice\":85}]', 85.00, 'Cash', 'Cancelled', NULL, NULL, NULL, NULL, '2026-05-19 21:09:19', '2026-05-19 21:09:36'),
(4, 2, 3, 'ORD-6A0D426ADCC75', '[{\"id\":1,\"vendor_id\":3,\"name\":\"Classic Beef Burger\",\"category\":\"Main Course\",\"price\":\"85.00\",\"status\":\"Available\",\"stock\":50,\"description\":\"A juicy 100% beef patty seasoned to perfection, topped with fresh lettuce, vine-ripened tomatoes, crunchy pickles, and our signature secret sauce on a toasted brioche bun.\",\"cooking_time\":\"5-10mins\",\"ingredients\":[],\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80\"],\"created_at\":\"2026-05-20T03:59:41.000000Z\",\"updated_at\":\"2026-05-20T04:01:18.000000Z\",\"quantity\":1,\"totalPrice\":85}]', 85.00, 'Cash', 'Cancelled', NULL, NULL, NULL, 'Out of stock / Ingredients unavailable', '2026-05-19 21:11:06', '2026-05-19 21:11:34'),
(5, 2, 3, 'ORD-6A0D432C80160', '[{\"id\":1,\"vendor_id\":3,\"name\":\"Classic Beef Burger\",\"category\":\"Main Course\",\"price\":\"85.00\",\"status\":\"Available\",\"stock\":50,\"description\":\"A juicy 100% beef patty seasoned to perfection, topped with fresh lettuce, vine-ripened tomatoes, crunchy pickles, and our signature secret sauce on a toasted brioche bun.\",\"cooking_time\":\"5-10mins\",\"ingredients\":[],\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80\"],\"created_at\":\"2026-05-20T03:59:41.000000Z\",\"updated_at\":\"2026-05-20T04:01:18.000000Z\",\"quantity\":1,\"totalPrice\":85}]', 85.00, 'Cash', 'Cancelled', NULL, NULL, NULL, 'Customer: Change of mind / Ordered wrong items', '2026-05-19 21:14:20', '2026-05-19 21:26:11'),
(6, 2, 3, 'ORD-6A0D46D16104A', '[{\"id\":1,\"vendor_id\":3,\"name\":\"Classic Beef Burger\",\"category\":\"Main Course\",\"price\":\"85.00\",\"status\":\"Available\",\"stock\":50,\"description\":\"A juicy 100% beef patty seasoned to perfection, topped with fresh lettuce, vine-ripened tomatoes, crunchy pickles, and our signature secret sauce on a toasted brioche bun.\",\"cooking_time\":\"5-10mins\",\"ingredients\":[],\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80\"],\"created_at\":\"2026-05-20T03:59:41.000000Z\",\"updated_at\":\"2026-05-20T04:01:18.000000Z\",\"quantity\":1,\"totalPrice\":85}]', 85.00, 'Cash', 'Cancelled', NULL, NULL, NULL, 'Vendor: Out of stock / Ingredients unavailable', '2026-05-19 21:29:53', '2026-05-19 21:30:10'),
(7, 2, 3, 'ORD-6A0D47EEA99E4', '[{\"id\":1,\"vendor_id\":3,\"name\":\"Classic Beef Burger\",\"category\":\"Main Course\",\"price\":\"85.00\",\"status\":\"Available\",\"stock\":50,\"description\":\"A juicy 100% beef patty seasoned to perfection, topped with fresh lettuce, vine-ripened tomatoes, crunchy pickles, and our signature secret sauce on a toasted brioche bun.\",\"cooking_time\":\"5-10mins\",\"ingredients\":[],\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80\"],\"created_at\":\"2026-05-20T03:59:41.000000Z\",\"updated_at\":\"2026-05-20T04:01:18.000000Z\",\"quantity\":1,\"notes\":\"More dressing\",\"totalPrice\":85}]', 85.00, 'Cash', 'Preparing', NULL, NULL, NULL, NULL, '2026-05-19 21:34:38', '2026-05-20 05:03:35'),
(8, 2, 3, 'ORD-6A0D490486B80', '[{\"id\":1,\"vendor_id\":3,\"name\":\"Classic Beef Burger\",\"category\":\"Main Course\",\"price\":\"85.00\",\"status\":\"Available\",\"stock\":50,\"description\":\"A juicy 100% beef patty seasoned to perfection, topped with fresh lettuce, vine-ripened tomatoes, crunchy pickles, and our signature secret sauce on a toasted brioche bun.\",\"cooking_time\":\"5-10mins\",\"ingredients\":[],\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80\"],\"created_at\":\"2026-05-20T03:59:41.000000Z\",\"updated_at\":\"2026-05-20T04:01:18.000000Z\",\"quantity\":1,\"notes\":\"More pickles\",\"totalPrice\":85},{\"id\":2,\"vendor_id\":3,\"name\":\"Crispy Chicken Sandwich\",\"category\":\"Main Course\",\"price\":\"75.00\",\"status\":\"Available\",\"stock\":30,\"description\":\"Hand-breaded chicken breast fried to golden perfection, served with spicy mayo and tangy coleslaw on a soft potato roll.\",\"cooking_time\":null,\"ingredients\":null,\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=400&q=80\"],\"created_at\":\"2026-05-20T03:59:41.000000Z\",\"updated_at\":\"2026-05-20T03:59:41.000000Z\",\"quantity\":1,\"notes\":\"more ketchup\",\"totalPrice\":75}]', 160.00, 'Cash', 'Served', 5, 'Delicious', NULL, NULL, '2026-05-19 21:39:16', '2026-05-20 05:03:35'),
(9, 2, 3, 'ORD-6A0D4F9F2005B', '[{\"id\":1,\"vendor_id\":3,\"name\":\"Classic Beef Burger\",\"category\":\"Main Course\",\"price\":\"85.00\",\"status\":\"Available\",\"stock\":50,\"description\":\"A juicy 100% beef patty seasoned to perfection, topped with fresh lettuce, vine-ripened tomatoes, crunchy pickles, and our signature secret sauce on a toasted brioche bun.\",\"cooking_time\":\"5-10mins\",\"ingredients\":[],\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80\"],\"created_at\":\"2026-05-20T03:59:41.000000Z\",\"updated_at\":\"2026-05-20T04:01:18.000000Z\",\"quantity\":1,\"notes\":\"dada\",\"totalPrice\":85}]', 85.00, 'Cash', 'Cancelled', NULL, NULL, NULL, 'Vendor: Technical / Kitchen issues', '2026-05-19 22:07:27', '2026-05-19 22:07:40'),
(10, 2, 3, 'ORD-6A0D516C22E06', '[{\"id\":1,\"vendor_id\":3,\"name\":\"Classic Beef Burger\",\"category\":\"Main Course\",\"price\":\"85.00\",\"status\":\"Available\",\"stock\":50,\"description\":\"A juicy 100% beef patty seasoned to perfection, topped with fresh lettuce, vine-ripened tomatoes, crunchy pickles, and our signature secret sauce on a toasted brioche bun.\",\"cooking_time\":\"5-10mins\",\"ingredients\":[],\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80\"],\"created_at\":\"2026-05-20T03:59:41.000000Z\",\"updated_at\":\"2026-05-20T04:01:18.000000Z\",\"quantity\":1,\"notes\":\"Paki damihan ng mayo\",\"totalPrice\":85}]', 85.00, 'Cash', 'Cancelled', NULL, NULL, NULL, 'Vendor: Out of stock / Ingredients unavailable', '2026-05-19 22:15:08', '2026-05-19 22:15:28'),
(11, 2, 3, 'ORD-6A0D52A82C540', '[{\"id\":1,\"vendor_id\":3,\"name\":\"Classic Beef Burger\",\"category\":\"Main Course\",\"price\":\"85.00\",\"status\":\"Available\",\"stock\":50,\"description\":\"A juicy 100% beef patty seasoned to perfection, topped with fresh lettuce, vine-ripened tomatoes, crunchy pickles, and our signature secret sauce on a toasted brioche bun.\",\"cooking_time\":\"5-10mins\",\"ingredients\":[],\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80\"],\"created_at\":\"2026-05-20T03:59:41.000000Z\",\"updated_at\":\"2026-05-20T04:01:18.000000Z\",\"quantity\":1,\"notes\":null,\"totalPrice\":85}]', 85.00, 'Cash', 'Cancelled', NULL, NULL, NULL, 'Vendor: Out of stock / Ingredients unavailable', '2026-05-19 22:20:24', '2026-05-19 22:20:34'),
(12, 2, 3, 'ORD-6A0D574149A3A', '[{\"id\":1,\"vendor_id\":3,\"name\":\"Classic Beef Burger\",\"category\":\"Main Course\",\"price\":\"85.00\",\"status\":\"Available\",\"stock\":50,\"description\":\"A juicy 100% beef patty seasoned to perfection, topped with fresh lettuce, vine-ripened tomatoes, crunchy pickles, and our signature secret sauce on a toasted brioche bun.\",\"cooking_time\":\"5-10mins\",\"ingredients\":[],\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80\"],\"created_at\":\"2026-05-20T03:59:41.000000Z\",\"updated_at\":\"2026-05-20T04:01:18.000000Z\",\"quantity\":1,\"notes\":null,\"totalPrice\":85}]', 85.00, 'Cash', 'Cancelled', NULL, NULL, NULL, 'Vendor: Out of stock / Ingredients unavailable', '2026-05-19 22:40:01', '2026-05-19 22:40:14'),
(13, 2, 3, 'ORD-6A0DAA6908CB4', '[{\"id\":2,\"vendor_id\":3,\"name\":\"Crispy Chicken Sandwich\",\"category\":\"Main Course\",\"price\":\"75.00\",\"status\":\"Available\",\"stock\":30,\"description\":\"Hand-breaded chicken breast fried to golden perfection, served with spicy mayo and tangy coleslaw on a soft potato roll.\",\"cooking_time\":null,\"ingredients\":null,\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=400&q=80\"],\"created_at\":\"2026-05-20T03:59:41.000000Z\",\"updated_at\":\"2026-05-20T03:59:41.000000Z\",\"quantity\":1,\"notes\":\"xvxcvcxv\",\"totalPrice\":75}]', 75.00, 'Cash', 'Pending', NULL, NULL, NULL, NULL, '2026-05-20 04:34:49', '2026-05-20 05:03:35'),
(14, 2, 3, 'ORD-6A0DAADC9BF90', '[{\"id\":2,\"vendor_id\":3,\"name\":\"Crispy Chicken Sandwich\",\"category\":\"Main Course\",\"price\":\"75.00\",\"status\":\"Available\",\"stock\":30,\"description\":\"Hand-breaded chicken breast fried to golden perfection, served with spicy mayo and tangy coleslaw on a soft potato roll.\",\"cooking_time\":null,\"ingredients\":null,\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=400&q=80\"],\"created_at\":\"2026-05-20T03:59:41.000000Z\",\"updated_at\":\"2026-05-20T03:59:41.000000Z\",\"quantity\":1,\"notes\":null,\"totalPrice\":75}]', 75.00, 'Cash', 'Pending', NULL, NULL, NULL, NULL, '2026-05-20 04:36:44', '2026-05-20 05:03:35'),
(15, 2, 3, 'ORD-6A0DAB90467D5', '[{\"id\":2,\"vendor_id\":3,\"name\":\"Crispy Chicken Sandwich\",\"category\":\"Main Course\",\"price\":\"75.00\",\"status\":\"Available\",\"stock\":30,\"description\":\"Hand-breaded chicken breast fried to golden perfection, served with spicy mayo and tangy coleslaw on a soft potato roll.\",\"cooking_time\":null,\"ingredients\":null,\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=400&q=80\"],\"created_at\":\"2026-05-20T03:59:41.000000Z\",\"updated_at\":\"2026-05-20T03:59:41.000000Z\",\"quantity\":1,\"notes\":null,\"totalPrice\":75}]', 75.00, 'GCash', 'Pending', NULL, NULL, NULL, NULL, '2026-05-20 04:39:44', '2026-05-20 05:03:35'),
(16, 2, 3, 'ORD-6A0DB290212CA', '[{\"id\":1,\"vendor_id\":3,\"name\":\"Classic Beef Burger\",\"category\":\"Main Course\",\"price\":\"85.00\",\"status\":\"Available\",\"stock\":50,\"description\":\"A juicy 100% beef patty seasoned to perfection, topped with fresh lettuce, vine-ripened tomatoes, crunchy pickles, and our signature secret sauce on a toasted brioche bun.\",\"cooking_time\":\"5-10mins\",\"ingredients\":[],\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80\"],\"created_at\":\"2026-05-20T03:59:41.000000Z\",\"updated_at\":\"2026-05-20T04:01:18.000000Z\",\"quantity\":1,\"notes\":null,\"totalPrice\":85}]', 85.00, 'GCash', 'Pending', NULL, NULL, NULL, NULL, '2026-05-20 05:09:36', '2026-05-20 05:09:36'),
(17, 2, 3, 'ORD-6A0DB3DA428BB', '[{\"id\":1,\"vendor_id\":3,\"name\":\"Classic Beef Burger\",\"category\":\"Main Course\",\"price\":\"85.00\",\"status\":\"Available\",\"stock\":50,\"description\":\"A juicy 100% beef patty seasoned to perfection, topped with fresh lettuce, vine-ripened tomatoes, crunchy pickles, and our signature secret sauce on a toasted brioche bun.\",\"cooking_time\":\"5-10mins\",\"ingredients\":[],\"images\":[\"https:\\/\\/images.unsplash.com\\/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80\"],\"created_at\":\"2026-05-20T03:59:41.000000Z\",\"updated_at\":\"2026-05-20T04:01:18.000000Z\",\"quantity\":1,\"notes\":null,\"totalPrice\":85}]', 85.00, 'GCash', 'Pending', NULL, NULL, NULL, NULL, '2026-05-20 05:15:06', '2026-05-20 05:15:06');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `preparing_vendor`
--

CREATE TABLE `preparing_vendor` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `vendor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `order_number` varchar(255) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `items` text NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `payment_method` varchar(255) NOT NULL DEFAULT 'Cash',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `preparing_vendor`
--

INSERT INTO `preparing_vendor` (`id`, `user_id`, `vendor_id`, `order_number`, `customer_name`, `items`, `total_price`, `payment_method`, `created_at`, `updated_at`) VALUES
(2, 2, 3, 'ORD-6A0D47EEA99E4', 'Mark James Pisngot', '1x Classic Beef Burger (More dressing)', 85.00, 'Cash', '2026-05-19 21:43:34', '2026-05-19 21:43:34');

-- --------------------------------------------------------

--
-- Table structure for table `procurement_vendors`
--

CREATE TABLE `procurement_vendors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `quantity` decimal(15,2) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `supplier` varchar(255) NOT NULL,
  `total_cost` decimal(15,2) NOT NULL,
  `date` date NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Delivered',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `served_vendor`
--

CREATE TABLE `served_vendor` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `vendor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `order_number` varchar(255) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `items` text NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `payment_method` varchar(255) NOT NULL DEFAULT 'Cash',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `served_vendor`
--

INSERT INTO `served_vendor` (`id`, `user_id`, `vendor_id`, `order_number`, `customer_name`, `items`, `total_price`, `payment_method`, `created_at`, `updated_at`) VALUES
(1, 2, 3, 'ORD-6A0D401067CFD', 'Mark James Pisngot', '1x Classic Beef Burger', 85.00, 'Cash', '2026-05-19 21:10:27', '2026-05-19 21:10:27'),
(2, 2, 3, 'ORD-6A0D490486B80', 'Mark James Pisngot', '1x Classic Beef Burger (More pickles), 1x Crispy Chicken Sandwich (more ketchup)', 160.00, 'Cash', '2026-05-19 21:57:55', '2026-05-19 21:57:55');

-- --------------------------------------------------------

--
-- Table structure for table `serving_vendor`
--

CREATE TABLE `serving_vendor` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `vendor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `order_number` varchar(255) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `items` text NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `payment_method` varchar(255) NOT NULL DEFAULT 'Cash',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('e1yQuHMUjECcqQeXiSGvwOEmr2ToNKNDhEw5s1v3', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiSkZxSlp1OUJ1cU00Z2RVT3JRN0ZUYVRNM1NaU3p2dXZQbFZmSUNRbyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTt9', 1779422593),
('OObEgbejuuXMALhEPHWRC5z9vOEz9hzhmlb4fhWZ', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiNVQzd2tsc05HMG1UbGFYTzdNZGIySEROTGZaRGFVNUpjMGk1bk91MiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTtzOjk6Il9wcmV2aW91cyI7YToyOntzOjM6InVybCI7czozNzoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL2FkbWluL2Rhc2hib2FyZCI7czo1OiJyb3V0ZSI7czoxNToiYWRtaW4uZGFzaGJvYXJkIjt9fQ==', 1779286355),
('VfkRvnYq7ogbOyztqz3R0umelxoW8iknYA9hJ4sY', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoib3hSYk9uVVBHeXVIQWNnN1FpM0U1cTVvUk5aZXFDclFLZGNvWDA0MCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzY6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC92ZW5kb3IvcHJvZmlsZSI7czo1OiJyb3V0ZSI7czoxNDoidmVuZG9yLnByb2ZpbGUiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aTozO30=', 1779283584);

-- --------------------------------------------------------

--
-- Table structure for table `stores`
--

CREATE TABLE `stores` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `store_name` varchar(255) DEFAULT NULL,
  `stall_number` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `opening_time` time DEFAULT NULL,
  `closing_time` time DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Open',
  `profile_image` varchar(255) DEFAULT NULL,
  `cover_photo` varchar(255) DEFAULT NULL,
  `rating` decimal(3,2) NOT NULL DEFAULT 0.00,
  `rating_count` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stores`
--

INSERT INTO `stores` (`id`, `user_id`, `store_name`, `stall_number`, `description`, `opening_time`, `closing_time`, `status`, `profile_image`, `cover_photo`, `rating`, `rating_count`, `created_at`, `updated_at`) VALUES
(1, 3, 'Deluxe', '1', 'bwisit ka aman marcus juan', '07:00:00', '17:00:00', 'Open', '/storage/profiles/1779250356_6a0d34b44b243.png', '/storage/covers/1779250356_6a0d34b45911f.png', 5.00, 2, '2026-05-19 20:11:39', '2026-05-20 04:10:21');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `id_number` varchar(255) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `store_name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `stall_number` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `opening_time` time DEFAULT NULL,
  `closing_time` time DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Open',
  `profile_image` varchar(255) DEFAULT NULL,
  `cover_photo` varchar(255) DEFAULT NULL,
  `rating` decimal(3,2) NOT NULL DEFAULT 0.00,
  `rating_count` int(11) NOT NULL DEFAULT 0,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `id_number`, `email_verified_at`, `password`, `role`, `store_name`, `phone`, `stall_number`, `description`, `opening_time`, `closing_time`, `status`, `profile_image`, `cover_photo`, `rating`, `rating_count`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Canteen Admin', 'admin@canteen.com', NULL, '2026-05-19 19:59:41', '$2y$12$4Lq1LyGlpq41i3HE4Ysv3enqVPL5BmZcbtLzvK3NRMKPLWm42XIka', 'admin', NULL, NULL, NULL, NULL, NULL, NULL, 'Open', NULL, NULL, 0.00, 0, 'thyw7jQ6bo', '2026-05-19 19:59:41', '2026-05-19 19:59:41'),
(2, 'Mark James Pisngot', 'markjames@gmail.com', '22012183', '2026-05-19 19:59:41', '$2y$12$AhWp/yf3CbLU22A2MCHau.iDWPLKoz0kj/zS3QDYHX2ksoYtQAqre', 'user', NULL, '09949960325', NULL, NULL, NULL, NULL, 'Open', '/storage/profiles/1779253120_6a0d3f8030fe3.png', NULL, 0.00, 0, 'w7qa6rCtpIqYm85hXbxDcFhNL3lpJozQfZP8oYYPtWFePGHiP4Kwlu12So8b', '2026-05-19 19:59:41', '2026-05-19 20:58:40'),
(3, 'Food Vendor', 'mark@gmail.com', NULL, '2026-05-19 19:59:41', '$2y$12$dx/vSqwcY0EXoQS2R9loGekbAHtecIA1t5pZHid0gE5KzT1twQ80a', 'vendor', 'Deluxe', NULL, '1', 'bwisit ka aman marcus juan', '07:00:00', '17:00:00', 'Open', '/storage/profiles/1779250356_6a0d34b44b243.png', '/storage/covers/1779250356_6a0d34b45911f.png', 5.00, 2, '2Wtybv3JDxxWXPSfRybMFEJcns9yuItHzVM7h6U0TwuPH8m57Wm87ZjZJHy2', '2026-05-19 19:59:41', '2026-05-20 04:10:21');

-- --------------------------------------------------------

--
-- Table structure for table `vendor_reviews`
--

CREATE TABLE `vendor_reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `vendor_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `rating` tinyint(4) NOT NULL,
  `comment` text DEFAULT NULL,
  `suggestion` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vendor_reviews`
--

INSERT INTO `vendor_reviews` (`id`, `user_id`, `vendor_id`, `order_id`, `rating`, `comment`, `suggestion`, `created_at`, `updated_at`) VALUES
(1, 2, 3, 8, 5, 'Delicious', NULL, '2026-05-20 03:46:39', '2026-05-20 03:46:39'),
(2, 2, 3, 2, 5, 'Sarap', 'Damihan kanin', '2026-05-20 04:10:21', '2026-05-20 04:10:21');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `inventory_vendors`
--
ALTER TABLE `inventory_vendors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `inventory_vendors_item_name_unique` (`item_name`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `menu_vendors_vendor_id_foreign` (`vendor_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders_vendor`
--
ALTER TABLE `orders_vendor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_vendor_order_number_unique` (`order_number`),
  ADD KEY `orders_vendor_user_id_foreign` (`user_id`),
  ADD KEY `orders_vendor_vendor_id_foreign` (`vendor_id`);

--
-- Indexes for table `order_user`
--
ALTER TABLE `order_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_user_order_number_unique` (`order_number`),
  ADD KEY `order_user_user_id_foreign` (`user_id`),
  ADD KEY `order_user_vendor_id_foreign` (`vendor_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `preparing_vendor`
--
ALTER TABLE `preparing_vendor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `preparing_vendor_user_id_foreign` (`user_id`),
  ADD KEY `preparing_vendor_vendor_id_foreign` (`vendor_id`);

--
-- Indexes for table `procurement_vendors`
--
ALTER TABLE `procurement_vendors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `served_vendor`
--
ALTER TABLE `served_vendor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `served_vendor_user_id_foreign` (`user_id`),
  ADD KEY `served_vendor_vendor_id_foreign` (`vendor_id`);

--
-- Indexes for table `serving_vendor`
--
ALTER TABLE `serving_vendor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `serving_vendor_user_id_foreign` (`user_id`),
  ADD KEY `serving_vendor_vendor_id_foreign` (`vendor_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `profile_vendors_user_id_foreign` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `vendor_reviews`
--
ALTER TABLE `vendor_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vendor_reviews_user_id_foreign` (`user_id`),
  ADD KEY `vendor_reviews_vendor_id_foreign` (`vendor_id`),
  ADD KEY `vendor_reviews_order_id_foreign` (`order_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_vendors`
--
ALTER TABLE `inventory_vendors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menus`
--
ALTER TABLE `menus`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `orders_vendor`
--
ALTER TABLE `orders_vendor`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `order_user`
--
ALTER TABLE `order_user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `preparing_vendor`
--
ALTER TABLE `preparing_vendor`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `procurement_vendors`
--
ALTER TABLE `procurement_vendors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `served_vendor`
--
ALTER TABLE `served_vendor`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `serving_vendor`
--
ALTER TABLE `serving_vendor`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `stores`
--
ALTER TABLE `stores`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `vendor_reviews`
--
ALTER TABLE `vendor_reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `menus`
--
ALTER TABLE `menus`
  ADD CONSTRAINT `menu_vendors_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders_vendor`
--
ALTER TABLE `orders_vendor`
  ADD CONSTRAINT `orders_vendor_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_vendor_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_user`
--
ALTER TABLE `order_user`
  ADD CONSTRAINT `order_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_user_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `preparing_vendor`
--
ALTER TABLE `preparing_vendor`
  ADD CONSTRAINT `preparing_vendor_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `preparing_vendor_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `served_vendor`
--
ALTER TABLE `served_vendor`
  ADD CONSTRAINT `served_vendor_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `served_vendor_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `serving_vendor`
--
ALTER TABLE `serving_vendor`
  ADD CONSTRAINT `serving_vendor_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `serving_vendor_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stores`
--
ALTER TABLE `stores`
  ADD CONSTRAINT `profile_vendors_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `vendor_reviews`
--
ALTER TABLE `vendor_reviews`
  ADD CONSTRAINT `vendor_reviews_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `order_user` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `vendor_reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `vendor_reviews_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
