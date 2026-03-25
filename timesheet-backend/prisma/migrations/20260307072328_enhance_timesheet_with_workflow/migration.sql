/*
  Warnings:

  - Added the required column `clientId` to the `Timelog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `combinedJobCode` to the `Timelog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `Timelog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Timelog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekStart` to the `Timelog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Timelog" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "billableStatus" TEXT NOT NULL DEFAULT 'billable',
ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "combinedJobCode" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "projectId" TEXT NOT NULL,
ADD COLUMN     "submissionStatus" TEXT NOT NULL DEFAULT 'not_submitted',
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "weekStart" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workItem" TEXT;

-- AddForeignKey
ALTER TABLE "Timelog" ADD CONSTRAINT "Timelog_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
