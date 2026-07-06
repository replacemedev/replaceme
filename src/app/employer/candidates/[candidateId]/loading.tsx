import { EmployerPageShell } from "@/components/employer/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerCandidateLoading() {
  return (
    <EmployerPageShell width="content" className="gap-6 pb-24 lg:pb-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Header Skeleton */}
          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm flex items-start gap-4 p-5">
            <div className="h-16 w-16 rounded-2xl bg-slate-200" />
            <div className="space-y-2 flex-1">
              <SkeletonBlock className="h-6 w-40 bg-slate-200 rounded" />
              <SkeletonBlock className="h-4 w-28 bg-slate-200 rounded" />
            </div>
          </div>

          {/* Compensation Skeleton */}
          <CardSkeleton minHeight="min-h-[80px]" />
          
          {/* Skills Skeleton */}
          <CardSkeleton minHeight="min-h-[120px]" />

          {/* Grouped Masked Sections Skeleton */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5 space-y-4">
              <SkeletonBlock className="h-4 w-32 bg-slate-200 rounded" />
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-40 bg-slate-100 rounded" />
                <SkeletonBlock className="h-3 w-48 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5 space-y-4">
              <SkeletonBlock className="h-4 w-24 bg-slate-200 rounded" />
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-full bg-slate-100 rounded" />
                <SkeletonBlock className="h-3 w-5/6 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5 space-y-4">
              <SkeletonBlock className="h-4 w-36 bg-slate-200 rounded" />
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-full bg-slate-100 rounded" />
                <SkeletonBlock className="h-3 w-2/3 bg-slate-100 rounded" />
              </div>
            </div>
          </div>
        </div>

        <aside>
          <CardSkeleton minHeight="min-h-[220px]" />
        </aside>
      </div>
    </EmployerPageShell>
  );
}
