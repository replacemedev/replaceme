import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";
import { WORKER_CARD } from "@/lib/worker/ui-tokens";

export default function WorkerEarningsLoading() {
  return (
    <WorkerPageShell width="content" className="animate-pulse">
      <WorkerPageHeader
        title={<SkeletonBlock className="h-9 w-32 rounded-xl" />}
        subhead={
          <SkeletonBlock className="h-4 w-full max-w-md rounded mt-1.5" />
        }
      />

      <div className="flex flex-col gap-6">
        {/* 1. Informational Banner Skeleton */}
        <div className="flex items-start gap-3 px-5 py-4 bg-slate-100/70 border border-slate-200/60 rounded-2xl">
          <SkeletonBlock className="h-5 w-5 shrink-0 rounded-full mt-0.5" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <SkeletonBlock className="h-3.5 w-full max-w-2xl rounded" />
            <SkeletonBlock className="h-3.5 w-3/4 max-w-lg rounded" />
          </div>
        </div>

        {/* 2. Metrics Overview (3 Cards) Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Recorded Earnings */}
          <div className={`${WORKER_CARD} p-6 border-t-4 border-t-slate-200`}>
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-3.5 w-32 rounded" />
              <SkeletonBlock className="h-8 w-8 rounded-xl shrink-0" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <SkeletonBlock className="h-8 w-28 rounded-lg" />
              <SkeletonBlock className="h-3.5 w-8 rounded" />
            </div>
            <SkeletonBlock className="h-3 w-44 rounded mt-3" />
          </div>

          {/* Card 2: Active Contracts */}
          <div className={`${WORKER_CARD} p-6 border-t-4 border-t-slate-200`}>
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-3.5 w-32 rounded" />
              <SkeletonBlock className="h-8 w-8 rounded-xl shrink-0" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <SkeletonBlock className="h-8 w-16 rounded-lg" />
              <SkeletonBlock className="h-3.5 w-16 rounded" />
            </div>
            <SkeletonBlock className="h-3 w-40 rounded mt-3" />
          </div>

          {/* Card 3: Projected Monthly Income */}
          <div className={`${WORKER_CARD} p-6 border-t-4 border-t-slate-200`}>
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-3.5 w-40 rounded" />
              <SkeletonBlock className="h-8 w-8 rounded-xl shrink-0" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <SkeletonBlock className="h-8 w-28 rounded-lg" />
              <SkeletonBlock className="h-3.5 w-8 rounded" />
            </div>
            <SkeletonBlock className="h-3 w-48 rounded mt-3" />
          </div>
        </div>

        {/* 3. Search & Filter Bar Skeleton */}
        <div className="w-full bg-white border border-slate-100 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <SkeletonBlock className="h-11 flex-1 rounded-2xl" />
          <SkeletonBlock className="h-11 w-full md:w-[165px] rounded-2xl shrink-0" />
        </div>

        {/* 4. Hire Records Table / Mobile List Skeleton */}
        <div className="flex flex-col gap-4">
          {/* Desktop Table Skeleton (≥ md) */}
          <div className="hidden md:block overflow-hidden bg-white border border-slate-100 rounded-3xl shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <SkeletonBlock className="h-3.5 w-20 rounded" />
              <SkeletonBlock className="h-3.5 w-24 rounded" />
              <SkeletonBlock className="h-3.5 w-24 rounded" />
              <SkeletonBlock className="h-3.5 w-24 rounded" />
              <SkeletonBlock className="h-3.5 w-16 rounded" />
            </div>
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between">
                  <SkeletonBlock className="h-4 w-24 rounded" />
                  <SkeletonBlock className="h-4 w-36 rounded" />
                  <SkeletonBlock className="h-4 w-28 rounded" />
                  <div className="space-y-1">
                    <SkeletonBlock className="h-4 w-20 rounded" />
                    <SkeletonBlock className="h-3 w-28 rounded" />
                  </div>
                  <SkeletonBlock className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Stacked Cards Skeleton (< md) */}
          <div className="block md:hidden bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden divide-y divide-slate-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <SkeletonBlock className="h-4 w-40 rounded" />
                    <SkeletonBlock className="h-3.5 w-28 rounded" />
                  </div>
                  <SkeletonBlock className="h-6 w-20 rounded-full shrink-0" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <div className="space-y-1">
                    <SkeletonBlock className="h-2.5 w-16 rounded" />
                    <SkeletonBlock className="h-3.5 w-20 rounded" />
                  </div>
                  <div className="space-y-1 items-end flex flex-col">
                    <SkeletonBlock className="h-2.5 w-16 rounded" />
                    <SkeletonBlock className="h-4 w-20 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Table Pagination Skeleton */}
          <div className="border border-slate-100 bg-white px-5 py-4 rounded-3xl shadow-xs flex items-center justify-between">
            <SkeletonBlock className="h-4 w-36 rounded" />
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-9 w-9 rounded-xl" />
              <SkeletonBlock className="h-9 w-9 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </WorkerPageShell>
  );
}
