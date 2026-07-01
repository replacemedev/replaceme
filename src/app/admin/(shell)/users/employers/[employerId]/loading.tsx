import { AdminPageShell } from "@/components/admin/layout";
import { AdminDetailSkeleton } from "@/components/admin/shared/AdminSkeletons";

export default function AdminEmployerDeepDiveLoading() {
  return (
    <AdminPageShell>
      <AdminDetailSkeleton />
    </AdminPageShell>
  );
}
