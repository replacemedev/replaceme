import { AdminPageShell } from "@/components/admin/layout";
import { AdminDetailSkeleton } from "@/components/admin/shared/AdminSkeletons";

export default function AdminJobDeepDiveLoading() {
  return (
    <AdminPageShell>
      <AdminDetailSkeleton />
    </AdminPageShell>
  );
}
