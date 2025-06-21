-- Создание базы данных для RP-сервера
CREATE DATABASE IF NOT EXISTS `ragemp_server` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `ragemp_server`;

-- Создание таблицы accounts для хранения данных пользователей
CREATE TABLE IF NOT EXISTS `accounts` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(32) NOT NULL,
    `email` VARCHAR(64) NOT NULL,
    `phone` VARCHAR(16) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE INDEX `username_UNIQUE` (`username` ASC),
    UNIQUE INDEX `email_UNIQUE` (`email` ASC),
    
    -- Дополнительные ограничения
    CONSTRAINT `chk_username_format` CHECK (CHAR_LENGTH(`username`) >= 3 AND CHAR_LENGTH(`username`) <= 20),
    CONSTRAINT `chk_email_format` CHECK (`email` LIKE '%@%.%')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Создание индексов для оптимизации поиска
CREATE INDEX `idx_username` ON `accounts` (`username`);
CREATE INDEX `idx_email` ON `accounts` (`email`);
CREATE INDEX `idx_created_at` ON `accounts` (`created_at`);

