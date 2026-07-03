import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";
import { WORKER_CARD } from "@/lib/worker/ui-tokens";

export default function WorkerInterviewsLoading() {
  return (
    <WorkerPageShell width="content" className="animate-pulse">
      <WorkerPageHeader
        title={<SkeletonBlock className="h-9 w-32 rounded-xl" />}
        subhead={<SkeletonBlock className="h-4 w-96 max-w-full rounded mt-2" />}
      />

      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, gidx) => (
          <section key={gidx} className="space-y-3">
            <SkeletonBlock className="h-4 w-24 rounded" />
            <ul className="space-y-3">
              {Array.from({ length: gidx === 0 ? 2 : 1 }).map((_, cidx) => (
                <li key={cidx}>
                  <article className={`${WORKER_CARD} p-5`}>
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 rounded-xl bg-slate-100" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <SkeletonBlock className="h-4 w-1/3 max-w-[15rem] rounded" />
                        <SkeletonBlock className="h-4 w-1/4 max-w-[10rem] rounded" />
                        <SkeletonBlock className="h-3.5 w-1/2 max-w-[18rem] rounded mt-2" />
                        <div className="flex gap-4 mt-3">
                          <SkeletonBlock className="h-3 w-20 rounded" />
                        </div>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </WorkerPageShell>
  );
}
