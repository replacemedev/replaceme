import { CardSkeleton, SkeletonBlock } from "./primitives";

export function JobSearchPageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-[#0a4a29] px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto space-y-4">
          <SkeletonBlock className="h-10 w-64 bg-white/20" />
          <SkeletonBlock className="h-4 w-full max-w-md bg-white/10" />
          <SkeletonBlock className="h-12 w-full max-w-2xl rounded-xl bg-white/10 mt-6" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <CardSkeleton className="lg:col-span-1 min-h-[400px]" />
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} minHeight="min-h-[220px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
