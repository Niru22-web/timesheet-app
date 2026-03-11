import RoleGuard from "@/components/layout/RoleGuard";
import ReportsDashboard from "@/components/reports/ReportsDashboard";

export default function ReportsPage() {
  return (
    <RoleGuard allowedRoles={["admin", "owner", "partner", "manager"]}>
      <ReportsDashboard />
    </RoleGuard>
  );
}