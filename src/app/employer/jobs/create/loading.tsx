import { EmployerPageShell, EmployerPageHeader } from "@/components/employer/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerJobCreateLoading() {
  return (
    <EmployerPageShell width="wide" className="gap-8 animate-pulse">
      <EmployerPageHeader
        title="Create a job post"
        subhead="Fill out each section below to list your open position and match with verified remote talent."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-8 items-start">
        <div className="space-y-6 min-w-0">
          <CardSkeleton minHeight="min-h-[500px]" />
        </div>
        <aside className="space-y-4">
          <CardSkeleton minHeight="min-h-[140px]" />
          <CardSkeleton minHeight="min-h-[220px]" />
        </aside>
      </div>
    </EmployerPageShell>
  );
}
