/*
  Warnings:

  - A unique constraint covering the columns `[combinedId]` on the table `Job` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `combinedId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "combinedId" TEXT NOT NULL,
ADD COLUMN     "createdBy" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Job_combinedId_key" ON "Job"("combinedId");
