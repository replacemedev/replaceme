import {
  CardSkeleton,
  GridCardSkeleton,
  PageHeaderSkeleton,
  SkeletonBlock,
  StatCardSkeleton,
  TitleSkeleton,
} from "./primitives";

export function WorkerDashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-10 animate-pulse">
      <div className="space-y-2">
        <TitleSkeleton size="lg" />
        <SkeletonBlock className="h-4 w-full max-w-2xl" />
      </div>

      <div className="space-y-4">
        <SkeletonBlock className="h-6 w-44" />
        <GridCardSkeleton columns={3} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <SkeletonBlock className="h-6 w-48" />
          <CardSkeleton minHeight="min-h-[100px]" />
          <CardSkeleton minHeight="min-h-[100px]" />
        </div>
        <div className="space-y-4">
          <CardSkeleton minHeight="min-h-[160px]" />
          <CardSkeleton minHeight="min-h-[200px]" />
        </div>
      </div>

      <div className="space-y-4">
        <SkeletonBlock className="h-6 w-32" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
