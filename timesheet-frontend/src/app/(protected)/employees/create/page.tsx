import RoleGuard from "@/components/layout/RoleGuard";
import EmployeeForm from "@/components/forms/EmployeeForm";

export default function CreateEmployeePage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <EmployeeForm />
    </RoleGuard>
  );
}