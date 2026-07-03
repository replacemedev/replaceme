import {
  AdminChartSkeleton,
  AdminPageHeaderSkeleton,
  AdminPanelSkeleton,
  AdminStatGridSkeleton,
} from "@/components/admin/shared/AdminSkeletons";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard">
      <AdminPageHeaderSkeleton />

      <AdminStatGridSkeleton count={4} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" />

      <AdminStatGridSkeleton count={3} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <AdminChartSkeleton titleWidth="w-36" />
          <AdminChartSkeleton titleWidth="w-44" />
        </div>
        <aside className="space-y-6">
          <AdminPanelSkeleton height="min-h-[200px]" titleWidth="w-28" rows={3} />
          <AdminPanelSkeleton height="min-h-[260px]" titleWidth="w-40" rows={4} />
        </aside>
      </section>
    </div>
  );
}
