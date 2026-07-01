import { AdminPageShell } from "@/components/admin/layout";
import { AdminDetailSkeleton } from "@/components/admin/shared/AdminSkeletons";

export default function AdminWorkerDeepDiveLoading() {
  return (
    <AdminPageShell>
      <AdminDetailSkeleton />
    </AdminPageShell>
  );
}
