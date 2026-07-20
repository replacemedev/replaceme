import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerOnboardingLoading() {
  return (
    <main className={`bg-slate-50/50 min-h-[calc(100vh-4rem)] py-8 md:py-12 lg:py-16 ${PUBLIC_PAGE_TOP}`}>
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero Skeleton */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 flex flex-col items-center">
          <SkeletonBlock className="h-7 w-44 rounded-full bg-slate-200 mb-3 animate-pulse" />
          <SkeletonBlock className="h-8 sm:h-10 md:h-12 w-3/4 rounded-xl bg-slate-200 mb-3 animate-pulse" />
          <SkeletonBlock className="h-5 w-full rounded-lg bg-slate-100 animate-pulse mb-1.5" />
          <SkeletonBlock className="h-5 w-4/5 rounded-lg bg-slate-100 animate-pulse" />
        </div>

        {/* 4 Step Cards Skeletons */}
        <div className="space-y-4 mt-6">
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs animate-pulse"
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-5">
                  {/* Step Number Circle Skeleton */}
                  <SkeletonBlock className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 shadow-xs" />
                  <div className="flex-1 min-w-0 w-full space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <SkeletonBlock className="h-6 w-1/2 rounded-md bg-slate-200" />
                      <SkeletonBlock className="h-5 w-28 rounded-full bg-slate-200 shrink-0" />
                    </div>
                    <SkeletonBlock className="h-4 w-full rounded-md bg-slate-100" />
                    <SkeletonBlock className="h-4 w-4/5 rounded-md bg-slate-100" />
                    <div className="bg-slate-50/80 rounded-xl p-3.5 sm:p-4 space-y-2 border border-slate-100">
                      <SkeletonBlock className="h-3.5 w-11/12 rounded-md bg-slate-100" />
                      <SkeletonBlock className="h-3.5 w-4/5 rounded-md bg-slate-100" />
                      <SkeletonBlock className="h-3.5 w-3/4 rounded-md bg-slate-100" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Card Skeleton */}
          <div className="mt-10 bg-slate-900 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl animate-pulse space-y-4">
            <SkeletonBlock className="h-6 w-44 rounded-full bg-slate-800" />
            <SkeletonBlock className="h-8 w-2/3 rounded-xl bg-slate-800" />
            <SkeletonBlock className="h-4 w-full rounded-md bg-slate-800/60" />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
              <SkeletonBlock className="h-11 w-full sm:w-44 rounded-xl bg-slate-800" />
              <SkeletonBlock className="h-11 w-full sm:w-36 rounded-xl bg-slate-800" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
