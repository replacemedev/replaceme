import { CardSkeleton, SkeletonBlock } from "./primitives";

export function JobDetailPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#f4f7f6] animate-pulse">
      <div className="bg-gray-300 h-48 sm:h-56" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardSkeleton className="lg:col-span-2 min-h-[400px]" />
          <div className="space-y-5">
            <CardSkeleton minHeight="min-h-[220px]" />
            <CardSkeleton minHeight="min-h-[200px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#f4f7f6] animate-pulse">
      <div className="bg-gray-300 h-40 sm:h-48" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardSkeleton className="lg:col-span-2 min-h-[500px]" />
          <div className="space-y-5">
            <CardSkeleton minHeight="min-h-[200px]" />
            <CardSkeleton minHeight="min-h-[180px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
