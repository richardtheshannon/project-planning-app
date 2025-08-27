-- AlterTable
ALTER TABLE "User" ADD COLUMN     "closedNotifications" JSONB DEFAULT '[]',
ADD COLUMN     "enableCloseableNotifications" BOOLEAN NOT NULL DEFAULT true;
