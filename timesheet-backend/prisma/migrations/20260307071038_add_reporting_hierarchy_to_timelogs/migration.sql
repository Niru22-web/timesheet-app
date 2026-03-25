-- AlterTable
ALTER TABLE "Timelog" ADD COLUMN     "reportingManagerId" TEXT,
ADD COLUMN     "reportingPartnerId" TEXT;

-- AddForeignKey
ALTER TABLE "Timelog" ADD CONSTRAINT "Timelog_reportingManagerId_fkey" FOREIGN KEY ("reportingManagerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timelog" ADD CONSTRAINT "Timelog_reportingPartnerId_fkey" FOREIGN KEY ("reportingPartnerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
