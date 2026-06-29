import { CardSkeleton, SkeletonBlock } from "./primitives";

export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-pulse">
      {/* Decorative top header banner (layout twin of /worker/profile) */}
      <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-[#0a4a29] to-[#006e2f] select-none">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        <div className="absolute -left-1/4 -top-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Main asymmetric grid layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8 pt-8 lg:pt-12 order-2 lg:order-1">
          {/* About section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-3">
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="h-3 w-full max-w-[44rem]" />
            <SkeletonBlock className="h-3 w-full max-w-[42rem]" />
            <SkeletonBlock className="h-3 w-full max-w-[36rem]" />
          </div>

          {/* Top Skills section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <SkeletonBlock className="h-8 w-8 rounded-lg" />
                <SkeletonBlock className="h-4 w-28" />
              </div>
              <SkeletonBlock className="h-3 w-24 hidden sm:block" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <SkeletonBlock className="h-3 w-32" />
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
                <SkeletonBlock className="h-4 w-44" />
              </div>
              <SkeletonBlock className="h-3 w-20 hidden sm:block" />
            </div>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <SkeletonBlock className="h-4 w-56" />
                  <SkeletonBlock className="h-3 w-40" />
                  <SkeletonBlock className="h-3 w-full max-w-[46rem]" />
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial Gallery section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <SkeletonBlock className="h-8 w-8 rounded-lg" />
                <SkeletonBlock className="h-4 w-64" />
              </div>
              <SkeletonBlock className="h-3 w-28 hidden sm:block" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} minHeight="min-h-[160px]" className="rounded-3xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="relative -mt-20 lg:-mt-32 bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 text-center space-y-6 select-none z-10">
            <div className="relative mx-auto w-32 h-32 rounded-full border-4 border-white shadow-md bg-slate-50 overflow-hidden flex items-center justify-center">
              <SkeletonBlock className="h-full w-full rounded-full bg-slate-200/70" />
            </div>

            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-52 mx-auto" />
              <SkeletonBlock className="h-4 w-40 mx-auto" />
            </div>

            <div className="flex justify-center items-center gap-2">
              <SkeletonBlock className="h-5 w-24 rounded-full" />
              <SkeletonBlock className="h-5 w-20 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-2 text-left">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="h-4 w-24" />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-2 text-left">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="h-4 w-24" />
              </div>
            </div>

            <div className="space-y-3.5 pt-2 border-t border-slate-100 text-left">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="h-3 w-28" />
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4">
              <SkeletonBlock className="h-12 w-full rounded-xl" />
              <SkeletonBlock className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
