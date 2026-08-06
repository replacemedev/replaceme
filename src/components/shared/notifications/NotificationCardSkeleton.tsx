"use client";

export function NotificationCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/90 border-l-4 border-l-slate-300 bg-white p-4 sm:p-5 shadow-sm space-y-3 animate-pulse">
      {/* Top Header Row: Badge & Timestamp */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2">
          {/* Micro Badge Skeleton */}
          <div className="h-5 w-24 rounded-full bg-slate-200" />
          {/* Unread Pill Skeleton */}
          <div className="h-5 w-16 rounded-full bg-slate-100" />
        </div>
        {/* Timestamp Skeleton */}
        <div className="h-3.5 w-20 rounded bg-slate-200/60 ml-auto" />
      </div>

      {/* Main Content Skeleton: Title & Message */}
      <div className="space-y-2 pt-0.5">
        <div className="h-4 w-2/5 rounded bg-slate-200/90" />
        <div className="h-3.5 w-full rounded bg-slate-200/70" />
        <div className="h-3.5 w-3/4 rounded bg-slate-200/50" />
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
