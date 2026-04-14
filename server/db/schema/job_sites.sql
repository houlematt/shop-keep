-- Run manually against your MySQL database (same DB as `users`).
-- Optional strings and status default to NULL (no empty-string sentinels).
-- status is free-text VARCHAR (not ENUM).

CREATE TABLE IF NOT EXISTS `job_sites` (
  `job_site_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(64) NULL DEFAULT NULL,
  `address_line1` VARCHAR(255) NULL DEFAULT NULL,
  `address_line2` VARCHAR(255) NULL DEFAULT NULL,
  `city` VARCHAR(120) NULL DEFAULT NULL,
  `state` VARCHAR(120) NULL DEFAULT NULL,
  `postal_code` VARCHAR(32) NULL DEFAULT NULL,
  `country` VARCHAR(2) NULL DEFAULT NULL,
  `latitude` DECIMAL(10, 7) NULL DEFAULT NULL,
  `longitude` DECIMAL(10, 7) NULL DEFAULT NULL,
  `customer_name` VARCHAR(255) NULL DEFAULT NULL,
  `phone` VARCHAR(64) NULL DEFAULT NULL,
  `notes` TEXT NULL DEFAULT NULL,
  `status` VARCHAR(64) NULL DEFAULT NULL,
  `is_active` TINYINT(1) NULL DEFAULT NULL COMMENT 'NULL = unset, 0 = inactive, 1 = active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`job_site_id`),
  KEY `job_sites_status_idx` (`status`(16)),
  KEY `job_sites_name_idx` (`name`(64)),
  KEY `job_sites_code_idx` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
