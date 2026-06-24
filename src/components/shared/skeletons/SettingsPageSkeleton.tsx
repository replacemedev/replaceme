import { CardSkeleton, SkeletonBlock } from "./primitives";

export function SettingsPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <SkeletonBlock className="h-10 w-48 mb-8" />
      <CardSkeleton minHeight="min-h-[400px]" />
    </div>
  );
}

export function GridListingPageSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-pulse">
      <SkeletonBlock className="h-10 w-56 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} minHeight="min-h-[260px]" />
        ))}
      </div>
    </div>
  );
}
