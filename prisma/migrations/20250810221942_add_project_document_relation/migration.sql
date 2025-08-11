-- AlterTable
ALTER TABLE `document` ADD COLUMN `projectId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
