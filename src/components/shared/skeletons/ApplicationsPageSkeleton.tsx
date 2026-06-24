import { CardSkeleton, SkeletonBlock, StatCardSkeleton } from "./primitives";

export function ApplicationsPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="mb-8 space-y-2">
        <SkeletonBlock className="h-10 w-56" />
        <SkeletonBlock className="h-4 w-full max-w-lg" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <CardSkeleton className="lg:col-span-1 min-h-[320px]" />
        <div className="lg:col-span-3 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
