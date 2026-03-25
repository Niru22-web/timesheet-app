-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "reportingManager" TEXT,
ADD COLUMN     "reportingPartner" TEXT;

-- AlterTable
ALTER TABLE "EmployeeProfile" ADD COLUMN     "currentPinCode" TEXT,
ADD COLUMN     "guardianAddress" TEXT,
ADD COLUMN     "guardianName" TEXT,
ADD COLUMN     "guardianNumber" TEXT,
ADD COLUMN     "personalEmail" TEXT,
ADD COLUMN     "personalMobile" TEXT;
