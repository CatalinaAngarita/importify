CREATE TABLE `auth_otps` (
	`id` char(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`code_hash` varchar(255) NOT NULL,
	`expires_at` datetime NOT NULL,
	`attempts` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `auth_otps_id` PRIMARY KEY(`id`),
	CONSTRAINT `auth_otps_email_uidx` UNIQUE(`email`),
	INDEX `auth_otps_expires_idx` (`expires_at`)
);
