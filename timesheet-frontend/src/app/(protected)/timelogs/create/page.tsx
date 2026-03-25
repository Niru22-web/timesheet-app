import RoleGuard from "@/components/layout/RoleGuard";
import TimelogForm from "@/components/forms/TimelogForm";

export default function CreateTimelogPage() {
  return (
    <RoleGuard allowedRoles={["user", "manager", "partner", "owner"]}>
      <TimelogForm />
    </RoleGuard>
  );
}