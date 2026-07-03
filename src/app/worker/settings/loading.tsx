import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function WorkerSettingsLoading() {
  return (
    <WorkerPageShell width="content" className="animate-pulse">
      <WorkerPageHeader
        title={<SkeletonBlock className="h-9 w-48 rounded-xl" />}
        subhead={<SkeletonBlock className="h-4 w-96 max-w-full rounded mt-2" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          <SkeletonBlock className="h-5 w-44 rounded" />
        </div>

        {/* Availability Form Skeleton */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <SkeletonBlock className="h-5 w-36 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonBlock className="h-4 w-24 rounded" />
              <SkeletonBlock className="h-10 w-full rounded-lg" />
            </div>
          ))}
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-4 w-4 rounded" />
            <SkeletonBlock className="h-4 w-32 rounded" />
          </div>
          <SkeletonBlock className="h-10 w-full sm:w-32 rounded-xl mt-2" />
        </div>

        {/* Report Employer Form Skeleton */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <SkeletonBlock className="h-5 w-36 rounded" />
          <SkeletonBlock className="h-3 w-56 rounded" />
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-16 rounded" />
            <SkeletonBlock className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-16 rounded" />
            <SkeletonBlock className="h-28 w-full rounded-lg" />
          </div>
          <SkeletonBlock className="h-10 w-full sm:w-32 rounded-xl mt-2" />
        </div>
      </div>
    </WorkerPageShell>
  );
}
