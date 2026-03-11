import RoleGuard from "@/components/layout/RoleGuard";
import ClientForm from "@/components/forms/ClientForm";

export default function CreateClientPage() {
  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <ClientForm />
    </RoleGuard>
  );
}