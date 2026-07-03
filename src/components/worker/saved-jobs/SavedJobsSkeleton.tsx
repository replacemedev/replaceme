import { WorkerPageShell } from "@/components/worker/layout";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";

export function SavedJobsSkeleton() {
  return (
    <WorkerPageShell width="content" className="gap-6 animate-pulse">
      <div className="mb-2 space-y-3">
        <SkeletonBlock className="h-8 w-40 bg-slate-200 rounded-lg" />
        <SkeletonBlock className="h-4 w-full max-w-md bg-slate-100 rounded" />
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <SkeletonBlock className="h-11 flex-1 bg-slate-100 rounded-xl" />
          <SkeletonBlock className="h-11 w-full sm:w-56 bg-slate-100 rounded-xl" />
        </div>
      </div>

      <ul className="space-y-4" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className="flex flex-col md:flex-row md:items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5"
          >
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <SkeletonBlock className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <SkeletonBlock className="h-4 w-3/4 max-w-xs bg-slate-200 rounded" />
                <SkeletonBlock className="h-3 w-1/3 max-w-[8rem] bg-slate-100 rounded" />
                <SkeletonBlock className="h-3 w-1/4 max-w-[6rem] bg-slate-100 rounded" />
              </div>
            </div>
            <div className="hidden md:flex gap-2">
              <SkeletonBlock className="h-6 w-16 bg-slate-100 rounded-full" />
              <SkeletonBlock className="h-6 w-20 bg-slate-100 rounded-full" />
            </div>
            <div className="flex gap-2 md:flex-col lg:flex-row">
              <SkeletonBlock className="h-10 w-24 bg-slate-100 rounded-xl" />
              <SkeletonBlock className="h-10 w-28 bg-slate-200 rounded-xl" />
            </div>
          </li>
        ))}
      </ul>
    </WorkerPageShell>
  );
}
