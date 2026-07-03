import { EmployerPageShell } from "@/components/employer/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerApplicantsLoading() {
  return (
    <EmployerPageShell width="content" className="animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-32 bg-slate-200 rounded" />
          <SkeletonBlock className="h-8 w-64 bg-slate-200 rounded-lg" />
        </div>
        <SkeletonBlock className="h-10 w-24 bg-slate-200 rounded-xl" />
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex gap-2 pb-2">
        <SkeletonBlock className="h-9 w-20 bg-slate-200 rounded-lg" />
        <SkeletonBlock className="h-9 w-24 bg-slate-200 rounded-lg" />
        <SkeletonBlock className="h-9 w-24 bg-slate-200 rounded-lg" />
      </div>

      {/* Applicants List Skeletons */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} minHeight="min-h-[140px]" />
        ))}
      </div>
    </EmployerPageShell>
  );
}
