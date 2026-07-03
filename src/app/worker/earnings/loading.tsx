import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";
import { WORKER_CARD } from "@/lib/worker/ui-tokens";

export default function WorkerEarningsLoading() {
  return (
    <WorkerPageShell width="content" className="animate-pulse">
      <WorkerPageHeader
        title={<SkeletonBlock className="h-9 w-28 rounded-xl" />}
        subhead={<SkeletonBlock className="h-4 w-96 max-w-full rounded mt-2" />}
      />

      <div className={`${WORKER_CARD} p-6 mb-6 space-y-2`}>
        <SkeletonBlock className="h-9 w-28 rounded-lg" />
        <SkeletonBlock className="h-4 w-24 rounded" />
      </div>

      <ul className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className={`${WORKER_CARD} flex items-center justify-between px-4 py-3`}
          >
            <SkeletonBlock className="h-4 w-24 rounded" />
            <SkeletonBlock className="h-4 w-16 rounded" />
          </li>
        ))}
      </ul>
    </WorkerPageShell>
  );
}
