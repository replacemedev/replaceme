import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";
import { WORKER_CARD } from "@/lib/worker/ui-tokens";

export default function WorkerApplicationDetailLoading() {
  return (
    <WorkerPageShell width="content" className="animate-pulse">
      <WorkerPageHeader
        title={<SkeletonBlock className="h-9 w-64 rounded-xl" />}
        subhead={<SkeletonBlock className="h-4 w-40 rounded mt-2" />}
        actions={
          <div className="flex flex-wrap gap-2">
            <SkeletonBlock className="h-9 w-24 rounded-xl shrink-0" />
            <SkeletonBlock className="h-9 w-28 rounded-xl shrink-0" />
          </div>
        }
      />

      <article className={`${WORKER_CARD} p-6 space-y-6`}>
        <div className="flex flex-wrap items-center gap-3">
          <SkeletonBlock className="h-5 w-20 rounded-md" />
          <SkeletonBlock className="h-5 w-16 rounded-full" />
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <SkeletonBlock className="h-5 w-24 rounded-md" />
          <div className="relative pl-6 border-l-2 border-slate-100 space-y-6 py-2">
            <div className="relative">
              <span className="absolute -left-[31px] top-0 h-4.5 w-4.5 rounded-full border-4 border-white bg-slate-200" />
              <SkeletonBlock className="h-4 w-32 rounded" />
              <SkeletonBlock className="h-3 w-20 rounded mt-1.5" />
            </div>
            <div className="relative">
              <span className="absolute -left-[31px] top-0 h-4.5 w-4.5 rounded-full border-4 border-white bg-slate-200" />
              <SkeletonBlock className="h-4 w-48 rounded" />
              <SkeletonBlock className="h-3 w-20 rounded mt-1.5" />
            </div>
          </div>
        </div>
      </article>
    </WorkerPageShell>
  );
}
