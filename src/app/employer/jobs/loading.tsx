import { EmployerPageShell, EmployerPageHeader } from "@/components/employer/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerJobsLoading() {
  return (
    <EmployerPageShell width="wide" className="animate-pulse">
      <EmployerPageHeader
        title="Your job posts"
        subhead="View and manage every listing you have published."
        actions={<div className="h-10 w-32 bg-slate-200 rounded-xl" />}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} minHeight="min-h-[160px]" />
        ))}
      </div>
    </EmployerPageShell>
  );
}
