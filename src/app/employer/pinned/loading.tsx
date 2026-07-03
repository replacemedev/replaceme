import { EmployerPageShell, EmployerPageHeader } from "@/components/employer/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerPinnedLoading() {
  return (
    <EmployerPageShell className="animate-pulse">
      <EmployerPageHeader
        title="Pinned workers"
        badge={<div className="h-6 w-8 bg-slate-200 rounded-full" />}
        subhead="Review and manage candidate profiles you have pinned for later."
      />

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} minHeight="min-h-[140px]" />
        ))}
      </div>
    </EmployerPageShell>
  );
}
