import {
  AdminPageHeaderSkeleton,
  AdminPanelSkeleton,
} from "@/components/admin/shared/AdminSkeletons";

export default function AdminPageEditLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading page editor">
      <AdminPageHeaderSkeleton />
      <AdminPanelSkeleton height="min-h-[420px]" titleWidth="w-24" rows={8} />
    </div>
  );
}
