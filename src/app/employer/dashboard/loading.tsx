import { EmployerPageShell, EmployerPageHeader } from "@/components/employer/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerDashboardLoading() {
  return (
    <EmployerPageShell width="wide" className="gap-6 animate-pulse">
      <EmployerPageHeader
        title="Welcome back!"
        subhead="Manage your job posts and review candidates."
        actions={<div className="h-10 w-32 bg-slate-200 rounded-xl" />}
      />

      {/* KPI Strip Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-2">
            <SkeletonBlock className="h-4 w-20 bg-slate-200 rounded" />
            <SkeletonBlock className="h-8 w-16 bg-slate-200 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pt-2">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-6 w-36 bg-slate-200 rounded" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} minHeight="min-h-[140px]" />
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <CardSkeleton minHeight="min-h-[300px]" />
        </aside>
      </div>
    </EmployerPageShell>
  );
}
