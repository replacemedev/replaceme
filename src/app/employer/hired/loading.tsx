import { EmployerPageShell, EmployerPageHeader } from "@/components/employer/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerHiredLoading() {
  return (
    <EmployerPageShell className="gap-8 animate-pulse">
      <EmployerPageHeader
        title="Hired workers"
        subhead="Manage active team members and their contracts."
        actions={<div className="h-10 w-32 bg-slate-200 rounded-xl" />}
      />

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} minHeight="min-h-[140px]" />
        ))}
      </div>
    </EmployerPageShell>
  );
}
