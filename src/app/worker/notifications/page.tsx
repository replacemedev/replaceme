import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchNotificationBootstrap } from "@/lib/notifications/fetch-initial";
import { WorkerNotificationsClient } from "@/components/worker/notifications/WorkerNotificationsClient";
import { WorkerPageShell } from "@/components/worker/layout";

export const metadata = {
  title: "Notifications",
};

export const dynamic = "force-dynamic";

export default async function WorkerNotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { notifications, unreadCount } = await fetchNotificationBootstrap(
    user.id,
    50
  );

  return (
    <WorkerPageShell width="content">
      <WorkerNotificationsClient
        notifications={notifications}
        unreadCount={unreadCount}
      />
    </WorkerPageShell>
  );
}
