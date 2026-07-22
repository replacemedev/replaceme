import { SkeletonBlock } from "./primitives";

export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-pulse overflow-x-hidden">
      {/* Decorative top header banner */}
      <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-[#0a4a29] to-[#006e2f] select-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        <div className="absolute -left-1/4 -top-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Main asymmetric grid layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8 pt-8 lg:pt-12 order-2 lg:order-1">
          {/* About section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <SkeletonBlock className="h-8 w-8 rounded-lg" />
                <SkeletonBlock className="h-4 w-28 rounded-md" />
              </div>
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-3.5 w-full rounded-md" />
              <SkeletonBlock className="h-3.5 w-11/12 rounded-md" />
              <SkeletonBlock className="h-3.5 w-4/5 rounded-md" />
            </div>
          </div>

          {/* Personal & Statutory Details section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <SkeletonBlock className="h-8 w-8 rounded-lg" />
                <SkeletonBlock className="h-4 w-60 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <SkeletonBlock className="h-3 w-40 rounded-md" />
                <div className="space-y-2.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-slate-50">
                      <SkeletonBlock className="h-3.5 w-24 rounded-md" />
                      <SkeletonBlock className="h-3.5 w-28 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <SkeletonBlock className="h-3 w-36 rounded-md" />
                <div className="space-y-2.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-slate-50">
                      <SkeletonBlock className="h-3.5 w-24 rounded-md" />
                      <SkeletonBlock className="h-3.5 w-28 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4 text-sm space-y-3">
              <SkeletonBlock className="h-3 w-44 rounded-md" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <SkeletonBlock className="h-3 w-16 rounded-md" />
                    <SkeletonBlock className="h-4 w-24 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Contacts section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <SkeletonBlock className="h-8 w-8 rounded-lg" />
                <SkeletonBlock className="h-4 w-44 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <SkeletonBlock className="h-3 w-24 rounded-md" />
                  <SkeletonBlock className="h-4 w-28 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* Top Skills section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <SkeletonBlock className="h-8 w-8 rounded-lg" />
                <SkeletonBlock className="h-4 w-28 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <SkeletonBlock className="h-3.5 w-32 rounded-md" />
                    <SkeletonBlock className="h-3.5 w-12 rounded-md" />
                  </div>
                  <SkeletonBlock className="h-2.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Project Highlights section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <SkeletonBlock className="h-8 w-8 rounded-lg" />
                <SkeletonBlock className="h-4 w-44 rounded-md" />
              </div>
            </div>
            <div className="space-y-6 divide-y divide-slate-100">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`space-y-3 ${i > 0 ? "pt-6" : ""}`}>
                  <SkeletonBlock className="h-5 w-56 rounded-md" />
                  <SkeletonBlock className="h-3.5 w-40 rounded-md" />
                  <SkeletonBlock className="h-3.5 w-full rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial Gallery section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <SkeletonBlock className="h-8 w-8 rounded-lg" />
                <SkeletonBlock className="h-4 w-60 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-5 rounded-3xl border border-slate-200/80 space-y-3 bg-white">
                  <div className="flex items-center gap-3">
                    <SkeletonBlock className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <SkeletonBlock className="h-4 w-28 rounded-md" />
                      <SkeletonBlock className="h-3 w-20 rounded-md" />
                    </div>
                  </div>
                  <SkeletonBlock className="h-3.5 w-full rounded-md" />
                  <SkeletonBlock className="h-3.5 w-4/5 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="relative -mt-20 lg:-mt-32 bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 text-center space-y-6 select-none z-10">
            {/* Profile Avatar Skeleton - matching exact real classes: w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 */}
            <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 overflow-hidden rounded-full border-4 border-white bg-slate-50 shadow-md flex items-center justify-center">
              <SkeletonBlock className="h-full w-full rounded-full" />
            </div>

            {/* Name and Title Skeleton */}
            <div className="space-y-2 flex flex-col items-center">
              <SkeletonBlock className="h-6 w-48 mx-auto rounded-md" />
              <SkeletonBlock className="h-4 w-36 mx-auto rounded-md" />
            </div>

            {/* Badges Skeleton */}
            <div className="flex justify-center items-center gap-2">
              <SkeletonBlock className="h-5 w-20 rounded-full" />
              <SkeletonBlock className="h-5 w-16 rounded-full" />
            </div>

            {/* Rate and Availability Boxes */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 w-full text-left">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
                <SkeletonBlock className="h-3 w-12 rounded-md" />
                <SkeletonBlock className="h-5 w-20 rounded-md" />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
                <SkeletonBlock className="h-3 w-12 rounded-md" />
                <SkeletonBlock className="h-5 w-20 rounded-md" />
              </div>
            </div>

            {/* Details List */}
            <div className="space-y-3.5 pt-2 border-t border-slate-100 text-left text-xs font-bold text-slate-600">
              <div className="flex justify-between items-center">
                <SkeletonBlock className="h-3.5 w-16 rounded-md" />
                <SkeletonBlock className="h-3.5 w-28 rounded-md" />
              </div>
              <div className="flex justify-between items-center">
                <SkeletonBlock className="h-3.5 w-24 rounded-md" />
                <SkeletonBlock className="h-3.5 w-20 rounded-md" />
              </div>
              <div className="flex justify-between items-center">
                <SkeletonBlock className="h-3.5 w-12 rounded-md" />
                <SkeletonBlock className="h-3.5 w-24 rounded-md" />
              </div>
              <div className="flex justify-between items-center">
                <SkeletonBlock className="h-3.5 w-16 rounded-md" />
                <SkeletonBlock className="h-3.5 w-16 rounded-md" />
              </div>
              <div className="flex justify-between items-center">
                <SkeletonBlock className="h-3.5 w-16 rounded-md" />
                <SkeletonBlock className="h-3.5 w-20 rounded-md" />
              </div>
            </div>

            {/* Action Button */}
            <div className="space-y-3 pt-4">
              <SkeletonBlock className="h-11 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

