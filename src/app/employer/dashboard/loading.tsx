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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <SkeletonBlock className="h-3 w-16 bg-slate-100 rounded" />
              <div className="h-4 w-4 bg-slate-100 rounded" />
            </div>
            <SkeletonBlock className="h-7 w-12 bg-slate-200 rounded-lg mt-1" />
            <SkeletonBlock className="h-3 w-20 bg-slate-100 rounded mt-0.5" />
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
