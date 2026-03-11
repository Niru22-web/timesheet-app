import ProtectedRoute from "@/components/layout/ProtectedRoute";
import RoleGuard from "@/components/layout/RoleGuard";

export default function ClientsPage() {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["admin", "manager"]}>
        <div>Clients Page</div>
      </RoleGuard>
    </ProtectedRoute>
  );
}