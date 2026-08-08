"use client";

export function NotificationCardSkeleton() {
  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm flex items-start justify-between gap-3 sm:gap-4 animate-pulse">
      <div className="min-w-0 flex-1 space-y-3">
        {/* Micro Badge Skeletons */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-5 w-24 rounded-full bg-slate-200" />
          <div className="h-5 w-16 rounded-full bg-slate-100" />
        </div>
        {/* Main Content Skeletons */}
        <div className="space-y-2 pt-0.5">
          <div className="h-4 w-2/5 rounded bg-slate-200/90" />
          <div className="h-3.5 w-full rounded bg-slate-200/70" />
          <div className="h-3.5 w-3/4 rounded bg-slate-200/50" />
        </div>
      </div>

      {/* Right Action & Timestamp Container Skeleton */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="h-3.5 w-20 rounded bg-slate-200/60" />
        <div className="h-6 w-20 rounded-md bg-slate-200/70" />
      </div>
    </div>
  );
}

export function NotificationFeedSkeleton() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto w-full">
      {/* Top Bar Skeleton */}
      <div className="flex items-center justify-between gap-3">
        <div className="h-6 w-36 rounded-full bg-slate-200/80" />
        <div className="h-9 w-28 rounded-xl bg-slate-200/60" />
      </div>

      {/* Date Bucket 1: TODAY */}
      <div className="space-y-3">
        <div className="h-3 w-16 rounded bg-slate-200/70" />
        <div className="space-y-3">
          <NotificationCardSkeleton />
          <NotificationCardSkeleton />
        </div>
      </div>

      {/* Date Bucket 2: YESTERDAY */}
      <div className="space-y-3">
        <div className="h-3 w-20 rounded bg-slate-200/70" />
        <div className="space-y-3">
          <NotificationCardSkeleton />
          <NotificationCardSkeleton />
        </div>
      </div>
    </div>
  );
}
