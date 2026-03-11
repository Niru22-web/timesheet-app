import RoleGuard from "@/components/layout/RoleGuard";
import TimelogTable from "@/components/tables/TimelogTable";

export default function TimelogsPage() {
  return (
    <RoleGuard allowedRoles={["user", "manager", "partner", "owner"]}>
      <TimelogTable />
    </RoleGuard>
  );
}