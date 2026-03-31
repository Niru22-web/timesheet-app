-- AlterTable
ALTER TABLE "EmployeeProfile" ALTER COLUMN "education" DROP NOT NULL,
ALTER COLUMN "maritalStatus" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "permanentAddress" DROP NOT NULL,
ALTER COLUMN "currentAddress" DROP NOT NULL,
ALTER COLUMN "pan" DROP NOT NULL,
ALTER COLUMN "aadhaar" DROP NOT NULL;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Notification';

-- CreateTable
CREATE TABLE "leave_transactions" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "year" INTEGER NOT NULL,

    CONSTRAINT "leave_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "relatedId" TEXT,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "leave_transactions" ADD CONSTRAINT "leave_transactions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
