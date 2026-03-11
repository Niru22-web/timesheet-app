import RoleGuard from "@/components/layout/RoleGuard";
import ProjectTable from "@/components/tables/ProjectTable";

export default function ProjectsPage() {
  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <ProjectTable />
    </RoleGuard>
  );
}