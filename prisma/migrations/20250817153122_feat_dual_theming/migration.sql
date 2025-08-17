/*
  Warnings:

  - You are about to drop the column `primaryBackgroundColor` on the `appearancesettings` table. All the data in the column will be lost.
  - You are about to drop the column `primaryColor` on the `appearancesettings` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryBackgroundColor` on the `appearancesettings` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryColor` on the `appearancesettings` table. All the data in the column will be lost.
  - You are about to drop the column `tertiaryBackgroundColor` on the `appearancesettings` table. All the data in the column will be lost.
  - You are about to drop the column `tertiaryColor` on the `appearancesettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `appearancesettings` DROP COLUMN `primaryBackgroundColor`,
    DROP COLUMN `primaryColor`,
    DROP COLUMN `secondaryBackgroundColor`,
    DROP COLUMN `secondaryColor`,
    DROP COLUMN `tertiaryBackgroundColor`,
    DROP COLUMN `tertiaryColor`,
    ADD COLUMN `darkAccent` VARCHAR(191) NULL DEFAULT '#27272a',
    ADD COLUMN `darkAccentForeground` VARCHAR(191) NULL DEFAULT '#fafafa',
    ADD COLUMN `darkBackground` VARCHAR(191) NULL DEFAULT '#09090b',
    ADD COLUMN `darkBorder` VARCHAR(191) NULL DEFAULT '#27272a',
    ADD COLUMN `darkCard` VARCHAR(191) NULL DEFAULT '#09090b',
    ADD COLUMN `darkCardForeground` VARCHAR(191) NULL DEFAULT '#fafafa',
    ADD COLUMN `darkDestructive` VARCHAR(191) NULL DEFAULT '#7f1d1d',
    ADD COLUMN `darkDestructiveForeground` VARCHAR(191) NULL DEFAULT '#fafafa',
    ADD COLUMN `darkForeground` VARCHAR(191) NULL DEFAULT '#fafafa',
    ADD COLUMN `darkInput` VARCHAR(191) NULL DEFAULT '#27272a',
    ADD COLUMN `darkMuted` VARCHAR(191) NULL DEFAULT '#27272a',
    ADD COLUMN `darkMutedForeground` VARCHAR(191) NULL DEFAULT '#a1a1aa',
    ADD COLUMN `darkPopover` VARCHAR(191) NULL DEFAULT '#09090b',
    ADD COLUMN `darkPopoverForeground` VARCHAR(191) NULL DEFAULT '#fafafa',
    ADD COLUMN `darkPrimary` VARCHAR(191) NULL DEFAULT '#fafafa',
    ADD COLUMN `darkPrimaryForeground` VARCHAR(191) NULL DEFAULT '#18181b',
    ADD COLUMN `darkRing` VARCHAR(191) NULL DEFAULT '#d4d4d8',
    ADD COLUMN `darkSecondary` VARCHAR(191) NULL DEFAULT '#27272a',
    ADD COLUMN `darkSecondaryForeground` VARCHAR(191) NULL DEFAULT '#fafafa',
    ADD COLUMN `lightAccent` VARCHAR(191) NULL DEFAULT '#f4f4f5',
    ADD COLUMN `lightAccentForeground` VARCHAR(191) NULL DEFAULT '#18181b',
    ADD COLUMN `lightBackground` VARCHAR(191) NULL DEFAULT '#ffffff',
    ADD COLUMN `lightBorder` VARCHAR(191) NULL DEFAULT '#e4e4e7',
    ADD COLUMN `lightCard` VARCHAR(191) NULL DEFAULT '#ffffff',
    ADD COLUMN `lightCardForeground` VARCHAR(191) NULL DEFAULT '#020817',
    ADD COLUMN `lightDestructive` VARCHAR(191) NULL DEFAULT '#ef4444',
    ADD COLUMN `lightDestructiveForeground` VARCHAR(191) NULL DEFAULT '#fafafa',
    ADD COLUMN `lightForeground` VARCHAR(191) NULL DEFAULT '#020817',
    ADD COLUMN `lightInput` VARCHAR(191) NULL DEFAULT '#e4e4e7',
    ADD COLUMN `lightMuted` VARCHAR(191) NULL DEFAULT '#f4f4f5',
    ADD COLUMN `lightMutedForeground` VARCHAR(191) NULL DEFAULT '#71717a',
    ADD COLUMN `lightPopover` VARCHAR(191) NULL DEFAULT '#ffffff',
    ADD COLUMN `lightPopoverForeground` VARCHAR(191) NULL DEFAULT '#020817',
    ADD COLUMN `lightPrimary` VARCHAR(191) NULL DEFAULT '#18181b',
    ADD COLUMN `lightPrimaryForeground` VARCHAR(191) NULL DEFAULT '#fafafa',
    ADD COLUMN `lightRing` VARCHAR(191) NULL DEFAULT '#18181b',
    ADD COLUMN `lightSecondary` VARCHAR(191) NULL DEFAULT '#f4f4f5',
    ADD COLUMN `lightSecondaryForeground` VARCHAR(191) NULL DEFAULT '#18181b';

-- AlterTable
ALTER TABLE `user` ALTER COLUMN `updatedAt` DROP DEFAULT;
