/*
  Warnings:

  - A unique constraint covering the columns `[convertedToDocumentationId]` on the table `FeatureRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DocumentationCategory" AS ENUM ('DEVELOPMENT', 'PROJECTS', 'CLIENTS', 'OPERATIONS', 'FINANCIALS', 'SETTINGS');

-- AlterTable
ALTER TABLE "FeatureRequest" ADD COLUMN     "convertedToDocumentationId" TEXT,
ADD COLUMN     "isConverted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "documentation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "DocumentationCategory" NOT NULL,
    "tags" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sourceFeatureRequestId" INTEGER,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documentation_sourceFeatureRequestId_key" ON "documentation"("sourceFeatureRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureRequest_convertedToDocumentationId_key" ON "FeatureRequest"("convertedToDocumentationId");

-- AddForeignKey
ALTER TABLE "FeatureRequest" ADD CONSTRAINT "FeatureRequest_convertedToDocumentationId_fkey" FOREIGN KEY ("convertedToDocumentationId") REFERENCES "documentation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentation" ADD CONSTRAINT "documentation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
