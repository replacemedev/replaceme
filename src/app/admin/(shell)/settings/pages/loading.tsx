import {
  AdminPageHeaderSkeleton,
  AdminPanelSkeleton,
} from "@/components/admin/shared/AdminSkeletons";

export default function AdminPagesSettingsLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading public pages">
      <AdminPageHeaderSkeleton />
      <AdminPanelSkeleton height="min-h-[320px]" titleWidth="w-48" rows={6} />
    </div>
  );
}
