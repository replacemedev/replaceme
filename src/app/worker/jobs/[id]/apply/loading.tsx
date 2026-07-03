import { WorkerPageShell } from "@/components/worker/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function WorkerApplyLoading() {
  return (
    <div className="animate-pulse">
      {/* Dark green header skeleton */}
      <div className="relative bg-[#0a4a29] pt-6 pb-20 sm:pb-24 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M10 0h2v2h-2V0zm0 18h2v2h-2v-2zM0 10h2v2H0v-2zm18 0h2v2h-2v-2zM4 4h2v2H4V4zm10 0h2v2h-2V4zM4 14h2v2H4v-2zm10 0h2v2h-2v-2z'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonBlock className="h-4 w-32 bg-white/20 rounded mb-8" />
          <div className="space-y-3">
            <SkeletonBlock className="h-8 sm:h-10 w-2/3 max-w-[20rem] bg-white/20 rounded-lg" />
            <SkeletonBlock className="h-4 w-1/3 max-w-[10rem] bg-white/20 rounded" />
          </div>
        </div>
      </div>

      <WorkerPageShell
        width="content"
        className="-mt-12 sm:-mt-16 relative z-10 pb-24 lg:pb-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CardSkeleton minHeight="min-h-[500px]" />
          </div>
          <div className="space-y-5">
            <CardSkeleton minHeight="min-h-[200px]" />
            <CardSkeleton minHeight="min-h-[180px]" />
          </div>
        </div>
      </WorkerPageShell>
    </div>
  );
}
