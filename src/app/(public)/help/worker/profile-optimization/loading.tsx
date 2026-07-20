import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function ProfileOptimizationLoading() {
  return (
    <main className={`bg-slate-50/50 min-h-[calc(100vh-4rem)] pt-8 sm:pt-12 pb-16 ${PUBLIC_PAGE_TOP}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero Skeleton */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 flex flex-col items-center">
          <SkeletonBlock className="h-7 w-44 rounded-full bg-slate-200 mb-3 animate-pulse" />
          <SkeletonBlock className="h-10 sm:h-12 w-3/4 rounded-xl bg-slate-200 mb-3 animate-pulse" />
          <SkeletonBlock className="h-5 w-full rounded-lg bg-slate-100 animate-pulse mb-1.5" />
          <SkeletonBlock className="h-5 w-4/5 rounded-lg bg-slate-100 animate-pulse" />
        </div>

        {/* 4 Optimization Tip Cards Skeletons */}
        <div className="space-y-6 mt-6">
          <div className="grid grid-cols-1 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs animate-pulse"
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <SkeletonBlock className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
                  <div className="flex-1 min-w-0 w-full space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <SkeletonBlock className="h-6 w-1/2 rounded-md bg-slate-200" />
                      <SkeletonBlock className="h-5 w-24 rounded-full bg-slate-200" />
                    </div>
                    <SkeletonBlock className="h-4 w-full rounded-md bg-slate-100" />
                    <SkeletonBlock className="h-4 w-4/5 rounded-md bg-slate-100" />
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
                      <SkeletonBlock className="h-3.5 w-11/12 rounded-md bg-slate-100" />
                      <SkeletonBlock className="h-3.5 w-3/4 rounded-md bg-slate-100" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Verification Process Section Skeleton */}
          <div className="mt-12 pt-10 border-t border-slate-200/80 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="space-y-2">
                <SkeletonBlock className="h-6 w-32 rounded-full bg-slate-200" />
                <SkeletonBlock className="h-8 w-64 rounded-xl bg-slate-200" />
                <SkeletonBlock className="h-4 w-96 max-w-full rounded-md bg-slate-100" />
              </div>
              <SkeletonBlock className="h-9 w-36 rounded-xl bg-slate-200 shrink-0" />
            </div>

            {/* 4 Verification Step Cards Skeletons */}
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex gap-4 items-start animate-pulse"
                >
                  {/* Step Number Circle Skeleton */}
                  <SkeletonBlock className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200" />
                  <div className="flex-1 min-w-0 space-y-2.5">
                    {/* Title Placeholder Bar */}
                    <div className="flex items-center justify-between gap-2">
                      <SkeletonBlock className="h-6 w-1/3 rounded-md bg-slate-200 mb-2" />
                      <SkeletonBlock className="h-5 w-20 rounded-full bg-slate-200" />
                    </div>
                    {/* Description Lines */}
                    <SkeletonBlock className="h-4 w-full rounded-md bg-slate-100" />
                    <SkeletonBlock className="h-4 w-4/5 rounded-md bg-slate-100" />
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-2">
                      <SkeletonBlock className="h-3.5 w-11/12 rounded-md bg-slate-100" />
                      <SkeletonBlock className="h-3.5 w-4/5 rounded-md bg-slate-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Banner Skeleton */}
          <div className="mt-10 bg-slate-800 rounded-2xl p-8 sm:p-10 shadow-xl animate-pulse space-y-4">
            <SkeletonBlock className="h-6 w-40 rounded-full bg-slate-700" />
            <SkeletonBlock className="h-8 w-2/3 rounded-xl bg-slate-700" />
            <SkeletonBlock className="h-4 w-full rounded-md bg-slate-700/60" />
            <div className="flex gap-4 pt-2">
              <SkeletonBlock className="h-11 w-36 rounded-xl bg-slate-700" />
              <SkeletonBlock className="h-11 w-36 rounded-xl bg-slate-700" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
