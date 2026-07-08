import {
  AdminChartSkeleton,
  AdminPageHeaderSkeleton,
  AdminPanelSkeleton,
  AdminStatGridSkeleton,
} from "@/components/admin/shared/AdminSkeletons";
import { AdminPageShell } from "@/components/admin/layout/AdminPageShell";
import { ADMIN_SECTION_LABEL } from "@/lib/admin/ui-tokens";

export function DashboardSkeleton() {
  return (
    <AdminPageShell className="gap-8" aria-busy="true" aria-label="Loading dashboard">
      <AdminPageHeaderSkeleton />

      <section className="space-y-4">
        <h2 className={ADMIN_SECTION_LABEL}>Key metrics</h2>
        <div className="space-y-4">
          <AdminStatGridSkeleton count={4} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" />
          <AdminStatGridSkeleton count={3} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className={ADMIN_SECTION_LABEL}>Analytics & activity</h2>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="space-y-6">
            <AdminChartSkeleton titleWidth="w-36" />
            <AdminChartSkeleton titleWidth="w-44" />
          </div>
          <aside className="space-y-6">
            <AdminPanelSkeleton height="min-h-[200px]" titleWidth="w-28" rows={3} />
            <AdminPanelSkeleton height="min-h-[260px]" titleWidth="w-40" rows={4} />
          </aside>
        </div>
      </section>
    </AdminPageShell>
  );
}
