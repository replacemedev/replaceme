import { SkeletonBlock } from "./primitives";

export function PricingPageSkeleton() {
  return (
    <div className="bg-[#f8fafe] min-h-screen pb-16 animate-pulse">
      {/* Page Header */}
      <header className="text-center max-w-3xl mx-auto px-4 mb-12">
        <SkeletonBlock className="h-10 w-64 mx-auto mb-4" />
        <SkeletonBlock className="h-5 w-full max-w-lg mx-auto" />
      </header>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-4 py-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between p-6 rounded-2xl bg-white border border-gray-200 shadow-sm min-h-[380px]"
          >
            <div className="space-y-4">
              <SkeletonBlock className="h-6 w-24" />
              <div className="flex items-baseline space-x-1 mt-2">
                <SkeletonBlock className="h-9 w-16" />
                <SkeletonBlock className="h-4 w-12" />
              </div>
              <SkeletonBlock className="h-4 w-full" />
              <div className="space-y-2.5 pt-4 border-t border-gray-100">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <SkeletonBlock className="h-4 w-4 rounded-full shrink-0" />
                    <SkeletonBlock className="h-3 w-5/6" />
                  </div>
                ))}
              </div>
            </div>
            <SkeletonBlock className="h-11 w-full rounded-xl mt-8" />
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <SkeletonBlock className="h-4 w-full max-w-md mx-auto rounded-md" />
      </div>

      {/* Compare Table */}
      <div className="max-w-7xl mx-auto px-4 py-12 hidden md:block">
        <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-sm">
          <div className="grid grid-cols-5 p-5 bg-gray-50 border-b border-gray-100">
            <SkeletonBlock className="h-5 w-28" />
            <SkeletonBlock className="h-5 w-20 mx-auto" />
            <SkeletonBlock className="h-5 w-20 mx-auto" />
            <SkeletonBlock className="h-5 w-20 mx-auto" />
            <SkeletonBlock className="h-5 w-20 mx-auto" />
          </div>
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-5 p-5 items-center">
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-4 w-16 mx-auto" />
                <SkeletonBlock className="h-4 w-16 mx-auto" />
                <SkeletonBlock className="h-4 w-16 mx-auto" />
                <SkeletonBlock className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-6 py-20 bg-[#f8fafe]">
        <SkeletonBlock className="h-8 w-80 mx-auto mb-16" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col justify-between p-8 rounded-2xl border border-slate-100 bg-white shadow-sm min-h-[220px]"
            >
              <div className="space-y-2">
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-11/12" />
                <SkeletonBlock className="h-4 w-3/4" />
              </div>
              <div className="mt-8 border-t border-slate-100 pt-6 space-y-2">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <SkeletonBlock className="h-8 w-40 mx-auto mb-12" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-3xl bg-white p-6 md:p-8 shadow-sm space-y-3"
            >
              <SkeletonBlock className="h-5 w-2/3" />
              <SkeletonBlock className="h-4 w-full" />
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <SkeletonBlock className="h-11 w-40 mx-auto rounded-xl" />
        </div>
      </div>
    </div>
  );
}
