-- AlterTable
ALTER TABLE "EmployeeProfile" ADD COLUMN     "employmentType" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "salary" DOUBLE PRECISION,
ADD COLUMN     "seniorityLevel" TEXT,
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "role_permissions" ADD COLUMN     "employees" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user_permissions" ADD COLUMN     "employees" BOOLEAN NOT NULL DEFAULT false;
