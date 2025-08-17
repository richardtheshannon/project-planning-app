-- AlterTable
ALTER TABLE `user` ADD COLUMN `sendAfternoonManifest` BOOLEAN NOT NULL DEFAULT false,
    ALTER COLUMN `updatedAt` DROP DEFAULT;
