import { CardSkeleton, SkeletonBlock } from "./primitives";

export function JobSearchPageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero (matches JobSearchHero gradient + centered copy + pill search) */}
      <div className="bg-gradient-to-b from-[#e8f7f4] via-[#f4faf8] to-[#f8fafe] px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <SkeletonBlock className="h-10 sm:h-12 w-80 max-w-full mx-auto bg-slate-200/70 rounded-xl" />
          <SkeletonBlock className="h-4 w-full max-w-md mx-auto bg-slate-200/60 rounded mt-4" />
          <SkeletonBlock className="h-4 w-64 mx-auto bg-slate-200/50 rounded mt-2" />

          <div className="mt-8 max-w-3xl mx-auto bg-white rounded-full shadow-lg border border-slate-200/80 p-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <SkeletonBlock className="h-10 flex-1 rounded-full bg-slate-100" />
              <SkeletonBlock className="hidden sm:block h-10 w-56 rounded-full bg-slate-100" />
              <SkeletonBlock className="h-10 w-full sm:w-36 rounded-full bg-slate-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="lg:hidden h-9 w-24 rounded-lg" />
                <SkeletonBlock className="h-4 w-64" />
              </div>
              <SkeletonBlock className="h-9 w-full sm:w-44 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} minHeight="min-h-[220px]" />
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
              <SkeletonBlock className="h-4 w-64" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
