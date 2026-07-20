import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function PublicJobsLoading() {
  return (
    <div
      className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 ${PUBLIC_PAGE_TOP}`}
    >
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Browse Jobs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 sm:mt-2">
          Explore active roles from verified employers. Sign up free to apply.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {Array.from({ length: 20 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col justify-between h-full bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm animate-pulse"
          >
            <div>
              {/* Header Skeleton */}
              <div className="flex items-start gap-3 sm:gap-4">
                <SkeletonBlock className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0 bg-slate-200" />
                <div className="flex-1 space-y-1.5 min-w-0">
                  <SkeletonBlock className="h-5 sm:h-6 w-3/4 max-w-[200px] rounded bg-slate-200" />
                  <SkeletonBlock className="h-3.5 sm:h-4 w-1/2 max-w-[130px] rounded bg-slate-200" />
                </div>
              </div>

              {/* Meta Row Skeleton */}
              <SkeletonBlock className="h-3.5 w-44 sm:w-52 rounded bg-slate-200 mt-3 sm:mt-4" />

              {/* Description Snippet Skeleton (2 lines) */}
              <div className="mt-3 space-y-1.5">
                <SkeletonBlock className="h-3.5 w-full rounded bg-slate-200" />
                <SkeletonBlock className="h-3.5 w-4/5 rounded bg-slate-200" />
              </div>
            </div>

            {/* Footer Skeleton */}
            <div className="mt-5 pt-3.5 sm:pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <SkeletonBlock className="h-5 w-24 sm:w-28 rounded bg-slate-200" />
              <SkeletonBlock className="h-10 w-28 rounded-xl bg-slate-200 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
