import RoleGuard from "@/components/layout/RoleGuard";
import JobForm from "@/components/forms/JobForm";

export default function CreateJobPage() {
  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <JobForm />
    </RoleGuard>
  );
}