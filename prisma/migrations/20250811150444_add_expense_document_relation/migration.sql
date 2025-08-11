-- AlterTable
ALTER TABLE `document` ADD COLUMN `expenseId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_expenseId_fkey` FOREIGN KEY (`expenseId`) REFERENCES `Expense`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
