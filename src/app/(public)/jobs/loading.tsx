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

      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <li key={index} className="h-full">
            <div className="flex flex-col justify-between h-full bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm animate-pulse">
              <div>
                {/* Header Area: Company Logo, Job Title, Company Name */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <SkeletonBlock className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0 bg-gray-200" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <SkeletonBlock className="h-5 w-48 bg-gray-200 rounded" />
                    <SkeletonBlock className="h-4 w-32 bg-gray-200 rounded" />
                  </div>
                </div>

                {/* Meta Row */}
                <SkeletonBlock className="h-4 w-64 mt-3 sm:mt-4 bg-gray-200 rounded" />

                {/* Description Area */}
                <div className="mt-3 space-y-2">
                  <SkeletonBlock className="h-4 w-full bg-gray-200 rounded" />
                  <SkeletonBlock className="h-4 w-4/5 bg-gray-200 rounded" />
                </div>
              </div>

              {/* Footer Area: Salary & Action CTA */}
              <div className="mt-5 pt-3.5 sm:pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <SkeletonBlock className="h-5 sm:h-6 w-24 rounded-md bg-gray-200" />
                <SkeletonBlock className="h-10 w-32 rounded-xl bg-gray-200 shrink-0" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}



