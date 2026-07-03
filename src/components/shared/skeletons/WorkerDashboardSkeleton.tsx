import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import {
  CardSkeleton,
  SkeletonBlock,
} from "./primitives";
import { WORKER_CARD } from "@/lib/worker/ui-tokens";

export function WorkerDashboardSkeleton() {
  return (
    <WorkerPageShell width="wide" className="gap-8 animate-pulse">
      {/* Header placeholder matching WorkerPageHeader */}
      <WorkerPageHeader
        title={<SkeletonBlock className="h-9 w-48 rounded-xl" />}
        subhead={<SkeletonBlock className="h-4 w-96 max-w-full rounded mt-2" />}
        bordered={false}
      />

      {/* WorkerKpiStrip skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${WORKER_CARD} flex flex-col gap-1 p-4`}>
            <div className="flex items-center justify-between gap-2">
              <SkeletonBlock className="h-3 w-16 rounded" />
              <div className="h-4 w-4 bg-slate-100 rounded" />
            </div>
            <SkeletonBlock className="h-7 w-10 rounded mt-1" />
            <SkeletonBlock className="h-3.5 w-20 rounded" />
          </div>
        ))}
      </div>

      {/* WorkerDashboardQuickLinks skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} minHeight="h-24" />
        ))}
      </div>

      {/* Recent messages skeleton */}
      <div className={`${WORKER_CARD} p-6 space-y-4`}>
        <SkeletonBlock className="h-5 w-32 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 border border-slate-100 rounded-2xl bg-slate-50/30">
              <div className="h-10 w-10 rounded-full bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <SkeletonBlock className="h-3.5 w-2/3 rounded" />
                <SkeletonBlock className="h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Recommended jobs column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-6 w-44 rounded" />
            <SkeletonBlock className="h-4 w-20 rounded" />
          </div>
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} minHeight="min-h-[120px]" />
            ))}
          </div>
        </div>

        {/* Sidebar column */}
        <div className="flex flex-col gap-6">
          {/* Profile Strength skeleton */}
          <CardSkeleton minHeight="min-h-[160px]" />
          {/* Earnings Overview skeleton */}
          <CardSkeleton minHeight="min-h-[220px]" />
        </div>
      </div>

      {/* My Skills skeleton */}
      <div className={`${WORKER_CARD} p-6 space-y-4`}>
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-5 w-24 rounded" />
          <SkeletonBlock className="h-4.5 w-16 rounded" />
        </div>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
      </div>
    </WorkerPageShell>
  );
}
