import RoleGuard from "@/components/layout/RoleGuard";
import EmployeeTable from "@/components/tables/EmployeeTable";

export default function EmployeesPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <EmployeeTable />
    </RoleGuard>
  );
}