import RoleGuard from "@/components/layout/RoleGuard";
import JobTable from "@/components/tables/JobTable";

export default function JobsPage() {
  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <JobTable />
    </RoleGuard>
  );
}