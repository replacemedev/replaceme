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
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} minHeight="min-h-[120px]" />
        ))}
      </div>
    </EmployerPageShell>
  );
}
