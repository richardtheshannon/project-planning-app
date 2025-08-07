/*
  Warnings:

  - You are about to drop the column `expenseDate` on the `expense` table. All the data in the column will be lost.
  - You are about to drop the column `vendor` on the `expense` table. All the data in the column will be lost.
  - You are about to alter the column `category` on the `expense` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(8))`.
  - Added the required column `date` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `expense` DROP COLUMN `expenseDate`,
    DROP COLUMN `vendor`,
    ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NOT NULL,
    MODIFY `category` ENUM('SOFTWARE', 'MARKETING', 'OFFICE_SUPPLIES', 'TRAVEL', 'OTHER') NOT NULL;
