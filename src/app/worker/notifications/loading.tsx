import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { NotificationFeedSkeleton } from "@/components/shared/notifications/NotificationCardSkeleton";

export default function WorkerNotificationsLoading() {
  return (
    <WorkerPageShell width="content">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <WorkerPageHeader
          title="Notifications"
          subhead="Updates about applications, messages, and offers."
        />
        <NotificationFeedSkeleton />
      </div>
    </WorkerPageShell>
  );
}
