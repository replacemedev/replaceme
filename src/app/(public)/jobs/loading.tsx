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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col justify-between h-full bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse"
          >
            <div>
              {/* Header Area: Logo, Title, and Company */}
              <div className="flex items-start gap-4">
                <SkeletonBlock className="h-12 w-12 rounded-lg shrink-0 bg-gray-200" />
                <div className="flex-1 space-y-2 min-w-0">
                  <SkeletonBlock className="h-5 w-48 mb-2 bg-gray-200" />
                  <SkeletonBlock className="h-4 w-32 bg-gray-200" />
                </div>
              </div>

              {/* Meta Row */}
              <SkeletonBlock className="h-4 w-64 mt-4 bg-gray-200" />

              {/* Description Area */}
              <div className="mt-4 space-y-2">
                <SkeletonBlock className="h-4 w-full bg-gray-200" />
                <SkeletonBlock className="h-4 w-4/5 bg-gray-200" />
              </div>
            </div>

            {/* Divider and Footer Area */}
            <div>
              <div className="w-full h-px bg-gray-100 my-4" />
              <div className="flex items-center justify-between">
                <SkeletonBlock className="h-6 w-24 rounded-md bg-gray-200" />
                <SkeletonBlock className="h-10 w-32 rounded-lg bg-gray-200 shrink-0" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


