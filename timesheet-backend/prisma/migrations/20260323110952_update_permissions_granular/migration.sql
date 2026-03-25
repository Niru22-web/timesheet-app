/*
  Warnings:

  - You are about to drop the column `companyDetails` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `primaryEmail` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `reportingManager` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `reportingPartner` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `adminPanel` on the `user_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `dashboard` on the `user_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `emailTemplates` on the `user_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `employees` on the `user_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `projects` on the `user_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `reports` on the `user_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `timesheet` on the `user_permissions` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Made the column `alias` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gstStatus` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pan` on table `Client` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Client" DROP COLUMN "companyDetails",
DROP COLUMN "notes",
DROP COLUMN "phone",
DROP COLUMN "primaryEmail",
DROP COLUMN "reportingManager",
DROP COLUMN "reportingPartner",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "partnerId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Active',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "alias" SET NOT NULL,
ALTER COLUMN "gstStatus" SET NOT NULL,
ALTER COLUMN "pan" SET NOT NULL;

-- AlterTable
ALTER TABLE "user_permissions" DROP COLUMN "adminPanel",
DROP COLUMN "dashboard",
DROP COLUMN "emailTemplates",
DROP COLUMN "employees",
DROP COLUMN "projects",
DROP COLUMN "reports",
DROP COLUMN "timesheet",
ADD COLUMN     "adminPanelCreate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "adminPanelDelete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "adminPanelEdit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "adminPanelView" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "clientsCreate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "clientsDelete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "clientsEdit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "clientsView" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dashboardCreate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dashboardDelete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dashboardEdit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dashboardView" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailTemplatesCreate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailTemplatesDelete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailTemplatesEdit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailTemplatesView" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "employeesCreate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "employeesDelete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "employeesEdit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "employeesView" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jobsCreate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jobsDelete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jobsEdit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jobsView" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectsCreate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectsDelete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectsEdit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectsView" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reportsCreate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reportsDelete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reportsEdit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reportsView" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "timesheetCreate" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "timesheetDelete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timesheetEdit" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "timesheetView" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "dashboardView" BOOLEAN NOT NULL DEFAULT true,
    "dashboardCreate" BOOLEAN NOT NULL DEFAULT false,
    "dashboardEdit" BOOLEAN NOT NULL DEFAULT false,
    "dashboardDelete" BOOLEAN NOT NULL DEFAULT false,
    "timesheetView" BOOLEAN NOT NULL DEFAULT true,
    "timesheetCreate" BOOLEAN NOT NULL DEFAULT true,
    "timesheetEdit" BOOLEAN NOT NULL DEFAULT true,
    "timesheetDelete" BOOLEAN NOT NULL DEFAULT false,
    "projectsView" BOOLEAN NOT NULL DEFAULT true,
    "projectsCreate" BOOLEAN NOT NULL DEFAULT false,
    "projectsEdit" BOOLEAN NOT NULL DEFAULT false,
    "projectsDelete" BOOLEAN NOT NULL DEFAULT false,
    "reportsView" BOOLEAN NOT NULL DEFAULT true,
    "reportsCreate" BOOLEAN NOT NULL DEFAULT false,
    "reportsEdit" BOOLEAN NOT NULL DEFAULT false,
    "reportsDelete" BOOLEAN NOT NULL DEFAULT false,
    "employeesView" BOOLEAN NOT NULL DEFAULT false,
    "employeesCreate" BOOLEAN NOT NULL DEFAULT false,
    "employeesEdit" BOOLEAN NOT NULL DEFAULT false,
    "employeesDelete" BOOLEAN NOT NULL DEFAULT false,
    "adminPanelView" BOOLEAN NOT NULL DEFAULT false,
    "adminPanelCreate" BOOLEAN NOT NULL DEFAULT false,
    "adminPanelEdit" BOOLEAN NOT NULL DEFAULT false,
    "adminPanelDelete" BOOLEAN NOT NULL DEFAULT false,
    "emailTemplatesView" BOOLEAN NOT NULL DEFAULT false,
    "emailTemplatesCreate" BOOLEAN NOT NULL DEFAULT false,
    "emailTemplatesEdit" BOOLEAN NOT NULL DEFAULT false,
    "emailTemplatesDelete" BOOLEAN NOT NULL DEFAULT false,
    "clientsView" BOOLEAN NOT NULL DEFAULT false,
    "clientsCreate" BOOLEAN NOT NULL DEFAULT false,
    "clientsEdit" BOOLEAN NOT NULL DEFAULT false,
    "clientsDelete" BOOLEAN NOT NULL DEFAULT false,
    "jobsView" BOOLEAN NOT NULL DEFAULT false,
    "jobsCreate" BOOLEAN NOT NULL DEFAULT false,
    "jobsEdit" BOOLEAN NOT NULL DEFAULT false,
    "jobsDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "relatedId" TEXT,
    "actionUrl" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_key" ON "role_permissions"("role");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
