import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function PublicHelpLoading() {
  return (
    <main className={`bg-slate-50/50 min-h-[calc(100vh-4rem)] ${PUBLIC_PAGE_TOP}`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero Skeleton */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 md:mb-16 flex flex-col items-center px-2 sm:px-0">
          <SkeletonBlock className="h-7 w-44 rounded-full bg-slate-200 mb-4 animate-pulse" />
          <SkeletonBlock className="h-9 sm:h-12 w-3/4 sm:w-2/3 rounded-xl bg-slate-200 mb-4 animate-pulse" />
          <SkeletonBlock className="h-5 w-full sm:w-5/6 rounded-lg bg-slate-100 animate-pulse mb-1.5" />
          <SkeletonBlock className="h-5 w-4/5 sm:w-2/3 rounded-lg bg-slate-100 animate-pulse" />
        </div>

        {/* 3 Categories Skeletons */}
        <div className="space-y-10 sm:space-y-14 md:space-y-16">
          {[
            { id: "cat-1", cardCount: 4 },
            { id: "cat-2", cardCount: 4 },
            { id: "cat-3", cardCount: 5 },
          ].map((cat) => (
            <section key={cat.id} className="space-y-6">
              {/* Category Header Skeleton */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-200/70">
                <div className="flex items-start sm:items-center gap-3">
                  <SkeletonBlock className="w-10 h-10 rounded-xl bg-slate-200 shrink-0 animate-pulse mt-0.5 sm:mt-0" />
                  <div className="space-y-2">
                    <SkeletonBlock className="h-7 w-44 rounded-lg bg-slate-200 animate-pulse" />
                    <SkeletonBlock className="h-4 w-64 rounded-md bg-slate-100 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Grid Skeletons */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
                {Array.from({ length: cat.cardCount }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full animate-pulse"
                  >
                    <div>
                      {/* Icon Placeholder */}
                      <SkeletonBlock className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-200 mb-4 shrink-0" />
                      {/* Title Placeholder */}
                      <SkeletonBlock className="h-6 w-3/4 rounded-md bg-slate-200 mb-3" />
                      {/* Description Lines */}
                      <SkeletonBlock className="h-4 w-full rounded-md bg-slate-100 mb-2" />
                      <SkeletonBlock className="h-4 w-5/6 rounded-md bg-slate-100" />
                    </div>

                    {/* Footer Read Link Line */}
                    <div className="mt-6 pt-4 border-t border-slate-100/80 flex items-center justify-between">
                      <SkeletonBlock className="h-4 w-24 rounded-md bg-slate-200" />
                      <SkeletonBlock className="h-4 w-4 rounded-md bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
