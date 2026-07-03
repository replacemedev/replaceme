import { WorkerPageShell } from "@/components/worker/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

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
          <div className="flex items-center justify-between gap-4 mb-8">
            <SkeletonBlock className="h-4 w-36 bg-white/20 rounded" />
            <SkeletonBlock className="h-8 w-16 bg-white/20 rounded-full" />
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-3 flex-1">
              <SkeletonBlock className="h-8 sm:h-10 w-2/3 max-w-[24rem] bg-white/20 rounded-lg" />
              <SkeletonBlock className="h-4.5 w-1/3 max-w-[12rem] bg-white/20 rounded" />
            </div>
            <div className="hidden lg:flex gap-2 shrink-0">
              <SkeletonBlock className="h-10 w-24 bg-white/20 rounded-xl" />
              <SkeletonBlock className="h-10 w-24 bg-white/20 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <WorkerPageShell
        width="content"
        className="-mt-12 sm:-mt-16 relative z-10 pb-24 lg:pb-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CardSkeleton minHeight="min-h-[400px]" />
          </div>
          <div className="space-y-5">
            <CardSkeleton minHeight="min-h-[220px]" />
            <CardSkeleton minHeight="min-h-[200px]" />
          </div>
        </div>
      </WorkerPageShell>
    </div>
  );
}
