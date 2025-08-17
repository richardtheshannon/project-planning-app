-- AlterTable
ALTER TABLE `user` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateTable
CREATE TABLE `AppearanceSettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'global_settings',
    `businessName` VARCHAR(191) NULL,
    `missionStatement` TEXT NULL,
    `lightModeLogoUrl` VARCHAR(191) NULL,
    `lightModeIconUrl` VARCHAR(191) NULL,
    `darkModeLogoUrl` VARCHAR(191) NULL,
    `darkModeIconUrl` VARCHAR(191) NULL,
    `primaryBackgroundColor` VARCHAR(191) NULL DEFAULT '#FFFFFF',
    `secondaryBackgroundColor` VARCHAR(191) NULL DEFAULT '#F8F9FA',
    `tertiaryBackgroundColor` VARCHAR(191) NULL DEFAULT '#E9ECEF',
    `primaryColor` VARCHAR(191) NULL DEFAULT '#3B82F6',
    `secondaryColor` VARCHAR(191) NULL DEFAULT '#0EA5E9',
    `tertiaryColor` VARCHAR(191) NULL DEFAULT '#10B981',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
