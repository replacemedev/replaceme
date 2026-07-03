import { EmployerPageShell } from "@/components/employer/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerCandidateLoading() {
  return (
    <EmployerPageShell width="content" className="gap-6 pb-24 lg:pb-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm flex items-start gap-4 p-5">
            <div className="h-16 w-16 rounded-2xl bg-slate-200" />
            <div className="space-y-2 flex-1">
              <SkeletonBlock className="h-6 w-40 bg-slate-200 rounded" />
              <SkeletonBlock className="h-4 w-28 bg-slate-200 rounded" />
            </div>
          </div>

          <CardSkeleton minHeight="min-h-[80px]" />
          <CardSkeleton minHeight="min-h-[140px]" />
          <CardSkeleton minHeight="min-h-[220px]" />
        </div>

        <aside className="space-y-6">
          <CardSkeleton minHeight="min-h-[180px]" />
          <CardSkeleton minHeight="min-h-[240px]" />
        </aside>
      </div>
    </EmployerPageShell>
  );
}
