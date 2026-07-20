import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function PublicJobDetailLoading() {
  return (
    <div className="min-h-screen bg-[#f4f7f6] pb-28 md:pb-12 animate-pulse">
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
          <div className="flex items-center gap-2 mb-8">
            <SkeletonBlock className="h-4 w-20 bg-white/20 rounded" />
            <span className="text-white/30 text-xs">/</span>
            <SkeletonBlock className="h-4 w-40 bg-white/20 rounded" />
          </div>
          <div className="space-y-3">
            <SkeletonBlock className="h-8 sm:h-10 w-2/3 max-w-[24rem] bg-white/20 rounded-lg" />
            <SkeletonBlock className="h-4.5 w-1/3 max-w-[14rem] bg-white/20 rounded" />
          </div>
        </div>
      </div>

      {/* Main body skeleton */}
      <div className="relative z-10 mx-auto -mt-12 sm:-mt-16 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* In Summary card skeleton */}
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 sm:p-8 space-y-4">
              <SkeletonBlock className="h-4 w-28 bg-slate-200 rounded" />
              <SkeletonBlock className="h-4 w-full bg-slate-200 rounded" />
              <SkeletonBlock className="h-4 w-5/6 bg-slate-200 rounded" />
              <div className="pt-2 grid gap-3 sm:grid-cols-2">
                <SkeletonBlock className="h-16 w-full bg-slate-100 rounded-xl" />
                <SkeletonBlock className="h-16 w-full bg-slate-100 rounded-xl" />
                <SkeletonBlock className="h-16 w-full bg-slate-100 rounded-xl sm:col-span-2" />
              </div>
            </div>

            {/* Overview Card Skeleton */}
            <CardSkeleton minHeight="min-h-[400px]" />
          </div>

          {/* Sidebar Cards Skeleton */}
          <div className="space-y-5">
            <CardSkeleton minHeight="min-h-[220px]" />
            <CardSkeleton minHeight="min-h-[200px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
