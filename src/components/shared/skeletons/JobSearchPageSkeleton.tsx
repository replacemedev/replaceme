import { WorkerPageShell } from "@/components/worker/layout";
import { SkeletonBlock } from "./primitives";

function JobCardSkeleton() {
  return (
    <article className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <header className="flex items-start justify-between gap-3 mb-3 w-full">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <SkeletonBlock className="shrink-0 w-11 h-11 rounded-xl bg-slate-100" />
          <div className="min-w-0 flex-1 space-y-2 mt-0.5">
            <SkeletonBlock className="h-4 w-3/4 rounded bg-slate-200/80" />
            <SkeletonBlock className="h-3.5 w-1/2 rounded bg-slate-100" />
          </div>
        </div>
        <SkeletonBlock className="shrink-0 w-8 h-8 rounded-lg bg-slate-100" />
      </header>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <SkeletonBlock className="h-5 w-16 rounded-md bg-slate-100" />
        <SkeletonBlock className="h-5 w-24 rounded-md bg-slate-100" />
        <SkeletonBlock className="h-5 w-20 rounded-md bg-slate-100" />
      </div>

      <div className="space-y-2 py-1 flex-1">
        <SkeletonBlock className="h-3 w-full rounded bg-slate-100" />
        <SkeletonBlock className="h-3 w-full rounded bg-slate-100" />
        <SkeletonBlock className="h-3 w-4/5 rounded bg-slate-50" />
      </div>

      <footer className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
          <SkeletonBlock className="h-3.5 w-16 rounded bg-slate-100" />
          <SkeletonBlock className="h-4 w-12 rounded bg-slate-100" />
          <SkeletonBlock className="h-4 w-14 rounded bg-slate-100" />
        </div>
        <SkeletonBlock className="h-4 w-24 rounded bg-slate-200/80 shrink-0" />
      </footer>
    </article>
  );
}

export function JobSearchPageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero (matches JobSearchHero gradient + centered copy + pill search) */}
      <div className="bg-gradient-to-b from-[#e8f7f4] via-[#f4faf8] to-[#f8fafe] px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <SkeletonBlock className="h-10 sm:h-12 w-80 max-w-full mx-auto bg-slate-200/70 rounded-xl" />
          <SkeletonBlock className="h-4 w-full max-w-md mx-auto bg-slate-200/60 rounded mt-4" />
          <SkeletonBlock className="h-4 w-64 mx-auto bg-slate-200/50 rounded mt-2" />

          {/* 1:1 Responsive Search Bar Skeleton */}
          <div className="mt-8 max-w-3xl mx-auto bg-white rounded-2xl md:rounded-full shadow-md border border-slate-200/80 p-3 md:p-2 flex flex-col md:flex-row md:items-center gap-0 md:gap-2">
            <div className="flex flex-1 items-center gap-2 px-3 py-3 md:py-2 min-w-0 border-b border-slate-100 md:border-0">
              <SkeletonBlock className="h-5 flex-1 rounded bg-slate-100" />
            </div>

            <div className="hidden md:block w-px h-8 bg-slate-200 shrink-0" />

            <div className="flex flex-1 items-center gap-2 px-3 py-3 md:py-2 min-w-0 md:max-w-[14rem]">
              <SkeletonBlock className="h-5 flex-1 rounded bg-slate-100" />
            </div>

            <SkeletonBlock className="shrink-0 w-full md:w-auto mt-3 md:mt-0 h-11 md:h-10 w-full md:w-32 rounded-xl md:rounded-full bg-slate-200" />
          </div>
        </div>
      </div>

      <WorkerPageShell width="wide" className="py-8 gap-0">
        <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
          {/* Filters sidebar */}
          <div className="hidden lg:block min-h-[560px] rounded-2xl border border-slate-100 bg-white p-5">
            <div className="flex items-center justify-between mb-5">
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className="h-3 w-16" />
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-16" />
                <SkeletonBlock className="h-10 w-full rounded-xl" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonBlock key={i} className="h-7 w-20 rounded-full" />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-24" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonBlock key={i} className="h-4 w-40" />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="h-10 w-full rounded-xl" />
                <SkeletonBlock className="h-3 w-28" />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="min-w-0 mt-6 lg:mt-0">
            {/* Control Filters Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                <SkeletonBlock className="lg:hidden h-9 w-24 rounded-lg bg-slate-100" />
                <SkeletonBlock className="h-4 w-40 bg-slate-100" />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <SkeletonBlock className="hidden sm:block h-4 w-12 bg-slate-100" />
                <SkeletonBlock className="h-9.5 w-full sm:w-44 rounded-lg bg-slate-100" />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
              <SkeletonBlock className="h-4 w-64" />
            </div>
          </div>
        </div>
      </WorkerPageShell>
    </div>
  );
}
