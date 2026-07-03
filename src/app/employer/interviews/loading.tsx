import { EmployerPageShell, EmployerPageHeader } from "@/components/employer/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerInterviewsLoading() {
  return (
    <EmployerPageShell className="animate-pulse">
      <EmployerPageHeader
        title="Interviews"
        subhead="Manage and track your upcoming and completed interviews with candidates."
      />

      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <SkeletonBlock className="h-5 w-48 bg-slate-200 rounded" />
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, j) => (
                <CardSkeleton key={j} minHeight="min-h-[120px]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </EmployerPageShell>
  );
}
