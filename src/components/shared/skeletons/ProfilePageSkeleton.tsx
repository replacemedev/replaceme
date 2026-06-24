import { CardSkeleton, SkeletonBlock } from "./primitives";

export function ProfilePageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <CardSkeleton className="min-h-[480px]" />
        <div className="lg:col-span-2 space-y-6">
          <CardSkeleton minHeight="min-h-[200px]" />
          <CardSkeleton minHeight="min-h-[160px]" />
          <div className="space-y-3">
            <SkeletonBlock className="h-6 w-32" />
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
