import { WorkerPageShell } from "@/components/worker/layout";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function WorkerJobDetailLoading() {
  return (
    <div className="animate-pulse">
      {/* Dark green header skeleton */}
      <div className="relative bg-[#0a4a29] pt-5 pb-20 sm:pb-24 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M10 0h2v2h-2V0zm0 18h2v2h-2v-2zM0 10h2v2H0v-2zm18 0h2v2h-2v-2zM4 4h2v2H4V4zm10 0h2v2h-2V4zM4 14h2v2H4v-2zm10 0h2v2h-2v-2z'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end w-full mb-6 sm:mb-8">
            <SkeletonBlock className="h-11 w-36 bg-white/20 rounded-full" />
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-3 flex-1 min-w-0">
              <SkeletonBlock className="h-8 sm:h-9 lg:h-10 w-3/4 max-w-xl bg-white/20 rounded-lg" />
              <SkeletonBlock className="h-4 sm:h-5 w-1/2 max-w-xs bg-white/20 rounded mt-3" />
            </div>
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <SkeletonBlock className="h-11 w-24 bg-white/20 rounded-xl" />
              <SkeletonBlock className="h-11 w-32 bg-white/20 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <WorkerPageShell
        width="content"
        className="-mt-12 sm:-mt-16 relative z-10 pb-24 lg:pb-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Overview Card Skeleton */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <SkeletonBlock className="h-5 w-5 bg-slate-200 rounded" />
              <SkeletonBlock className="h-4 w-32 bg-slate-200 rounded" />
            </div>
            <div className="space-y-3">
              <SkeletonBlock className="h-4 w-full bg-slate-200 rounded" />
              <SkeletonBlock className="h-4 w-11/12 bg-slate-200 rounded" />
              <SkeletonBlock className="h-4 w-4/5 bg-slate-200 rounded" />
            </div>
            <div className="space-y-4 pt-2">
              <SkeletonBlock className="h-4 w-40 bg-slate-200 rounded" />
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <SkeletonBlock className="h-6 w-6 rounded-full bg-slate-200 shrink-0" />
                  <SkeletonBlock className="h-4 w-5/6 bg-slate-200 rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <SkeletonBlock className="h-6 w-6 rounded-full bg-slate-200 shrink-0" />
                  <SkeletonBlock className="h-4 w-3/4 bg-slate-200 rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <SkeletonBlock className="h-6 w-6 rounded-full bg-slate-200 shrink-0" />
                  <SkeletonBlock className="h-4 w-2/3 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Job Sidebar Cards Skeletons */}
          <div className="space-y-5">
            {/* Job Details Card Skeleton */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <SkeletonBlock className="h-5 w-5 bg-slate-200 rounded" />
                <SkeletonBlock className="h-4 w-28 bg-slate-200 rounded" />
              </div>
              <div className="space-y-3 py-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                    <SkeletonBlock className="h-4 w-4 bg-slate-200 rounded shrink-0 mt-0.5" />
                    <div className="space-y-1.5 flex-1">
                      <SkeletonBlock className="h-3 w-16 bg-slate-200 rounded" />
                      <SkeletonBlock className="h-4 w-24 bg-slate-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Employer Info Card Skeleton */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <SkeletonBlock className="h-5 w-5 bg-slate-200 rounded" />
                <SkeletonBlock className="h-4 w-32 bg-slate-200 rounded" />
              </div>
              <div className="space-y-4 py-1">
                <div className="space-y-1.5 border-b border-slate-100 pb-3">
                  <SkeletonBlock className="h-3 w-24 bg-slate-200 rounded" />
                  <SkeletonBlock className="h-4 w-36 bg-slate-200 rounded" />
                </div>
                <div className="space-y-1.5 border-b border-slate-100 pb-3">
                  <SkeletonBlock className="h-3 w-20 bg-slate-200 rounded" />
                  <SkeletonBlock className="h-4 w-28 bg-slate-200 rounded" />
                </div>
                <div className="space-y-1.5">
                  <SkeletonBlock className="h-3 w-28 bg-slate-200 rounded" />
                  <SkeletonBlock className="h-4 w-24 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </WorkerPageShell>
    </div>
  );
}
