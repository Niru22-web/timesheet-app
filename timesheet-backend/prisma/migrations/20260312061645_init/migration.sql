/*
  Warnings:

  - You are about to drop the column `closingBalance` on the `LeaveBalance` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `LeaveBalance` table. All the data in the column will be lost.
  - You are about to drop the column `leavesEarned` on the `LeaveBalance` table. All the data in the column will be lost.
  - You are about to drop the column `leavesTaken` on the `LeaveBalance` table. All the data in the column will be lost.
  - You are about to drop the column `openingBalance` on the `LeaveBalance` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `LeaveBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `LeaveBalance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LeaveBalance" DROP CONSTRAINT "LeaveBalance_employeeId_fkey";

-- AlterTable
ALTER TABLE "LeaveBalance" DROP COLUMN "closingBalance",
DROP COLUMN "lastUpdated",
DROP COLUMN "leavesEarned",
DROP COLUMN "leavesTaken",
DROP COLUMN "openingBalance",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "remainingLeaves" INTEGER NOT NULL DEFAULT 21,
ADD COLUMN     "totalLeaves" INTEGER NOT NULL DEFAULT 21,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "usedLeaves" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "year" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "EmailConnection" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiry" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailConnection_employeeId_provider_key" ON "EmailConnection"("employeeId", "provider");

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employeeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailConnection" ADD CONSTRAINT "EmailConnection_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employeeId") ON DELETE CASCADE ON UPDATE CASCADE;
