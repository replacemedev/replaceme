import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { CardSkeleton, SkeletonBlock } from "./primitives";

export function ApplicationsPageSkeleton() {
  return (
    <WorkerPageShell width="wide" className="py-8 gap-4 animate-pulse">
      <WorkerPageHeader
        title={<SkeletonBlock className="h-8 w-48 bg-slate-200 rounded-xl" />}
        subhead={<SkeletonBlock className="h-4 w-96 bg-slate-200 rounded-lg mt-2" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
            <SkeletonBlock className="h-3 w-16 bg-slate-200 rounded" />
            <SkeletonBlock className="h-8 w-12 bg-slate-200 rounded-lg" />
            <SkeletonBlock className="h-3.5 w-24 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 pt-4">
        <div className="hidden lg:block rounded-2xl border border-slate-100 bg-white p-5 min-h-[300px]" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} minHeight="min-h-[100px]" />
          ))}
        </div>
      </div>
    </WorkerPageShell>
  );
}
