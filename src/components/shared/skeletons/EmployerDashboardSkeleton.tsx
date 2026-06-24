import {
  CardSkeleton,
  ListRowSkeleton,
  PageHeaderSkeleton,
  SkeletonBlock,
} from "./primitives";

export function EmployerDashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8 animate-pulse">
      <PageHeaderSkeleton withAction />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          <div className="space-y-4">
            <SkeletonBlock className="h-6 w-40" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CardSkeleton minHeight="min-h-[180px]" />
              <CardSkeleton minHeight="min-h-[180px]" />
            </div>
          </div>
          <div className="space-y-4">
            <SkeletonBlock className="h-6 w-44" />
            <div className="space-y-3">
              <ListRowSkeleton />
              <ListRowSkeleton />
              <ListRowSkeleton />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <CardSkeleton minHeight="min-h-[200px]" />
          <CardSkeleton minHeight="min-h-[160px]" />
        </div>
      </div>
    </div>
  );
}
