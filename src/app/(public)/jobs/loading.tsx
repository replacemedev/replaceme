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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col justify-between h-full bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-pulse"
          >
            <div>
              {/* Header Area: Logo, Title, and Company */}
              <div className="flex items-start gap-4">
                <SkeletonBlock className="w-12 h-12 rounded-xl shrink-0 bg-gray-200" />
                <div className="flex-1 space-y-2 min-w-0">
                  <SkeletonBlock className="h-5 w-3/4 max-w-[200px] rounded bg-gray-200" />
                  <SkeletonBlock className="h-4 w-1/2 max-w-[130px] rounded bg-gray-200" />
                </div>
              </div>

              {/* Description Area: Multi-line placeholder */}
              <div className="mt-4 space-y-2">
                <SkeletonBlock className="h-3.5 w-full rounded bg-gray-200" />
                <SkeletonBlock className="h-3.5 w-11/12 rounded bg-gray-200" />
                <SkeletonBlock className="h-3.5 w-4/5 rounded bg-gray-200" />
              </div>

              {/* Skills/Tags Row */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <SkeletonBlock className="h-6 w-16 rounded-full bg-gray-200" />
                <SkeletonBlock className="h-6 w-20 rounded-full bg-gray-200" />
                <SkeletonBlock className="h-6 w-14 rounded-full bg-gray-200" />
              </div>
            </div>

            {/* Footer Area: Salary / Meta & Action CTA */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
              <SkeletonBlock className="h-4 w-28 rounded bg-gray-200" />
              <SkeletonBlock className="h-10 w-28 rounded-xl bg-gray-200 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

