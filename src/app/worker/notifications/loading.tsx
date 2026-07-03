import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";
import { WORKER_CARD } from "@/lib/worker/ui-tokens";

export default function WorkerNotificationsLoading() {
  return (
    <WorkerPageShell width="content" className="animate-pulse">
      <WorkerPageHeader
        title={<SkeletonBlock className="h-9 w-36 rounded-xl" />}
        subhead={<SkeletonBlock className="h-4 w-96 max-w-full rounded mt-2" />}
      />

      <div className="space-y-4">
        <div className="flex justify-end">
          <SkeletonBlock className="h-5 w-28 rounded" />
        </div>

        <ul className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className={`${WORKER_CARD} px-4 py-3 space-y-2`}>
              <SkeletonBlock className="h-4 w-1/4 max-w-[12rem] rounded" />
              <SkeletonBlock className="h-4.5 w-1/2 max-w-[20rem] rounded" />
              <SkeletonBlock className="h-3 w-32 rounded mt-1" />
            </li>
          ))}
        </ul>
      </div>
    </WorkerPageShell>
  );
}
