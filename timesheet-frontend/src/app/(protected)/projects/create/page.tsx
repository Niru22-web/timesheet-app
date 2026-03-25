import RoleGuard from "@/components/layout/RoleGuard";
import ProjectForm from "@/components/forms/ProjectForm";

export default function CreateProjectPage() {
  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <ProjectForm />
    </RoleGuard>
  );
}