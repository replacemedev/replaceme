import { EmployerPageShell, EmployerPageHeader } from "@/components/employer/layout";
import { NotificationFeedSkeleton } from "@/components/shared/notifications/NotificationCardSkeleton";

export default function EmployerNotificationsLoading() {
  return (
    <EmployerPageShell width="content">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <EmployerPageHeader
          title="Notifications"
          subhead="Applicant updates, messages, and hiring activity."
        />
        <NotificationFeedSkeleton />
      </div>
    </EmployerPageShell>
  );
}
