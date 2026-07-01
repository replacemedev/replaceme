import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPageShell } from "@/components/admin/layout";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { fetchNotificationBootstrap } from "@/lib/notifications/fetch-initial";
import { AdminNotificationsClient } from "@/components/admin/notifications/AdminNotificationsClient";
import { ErrorState } from "@/components/shared/ErrorState";

export const metadata = {
  title: "Notifications | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  try {
    const bootstrap = await fetchNotificationBootstrap(user.id, 50);

    return (
      <AdminPageShell>
        <AdminNotificationsClient userId={user.id} initialBootstrap={bootstrap} />
      </AdminPageShell>
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to load notifications.";
    return (
      <AdminPageShell>
        <AdminPageHeader
          title="Notifications"
          description="Platform alerts for moderation, billing, and system events."
        />
        <ErrorState
          title="Unable to load notifications"
          description={message}
          retryHref="/admin/notifications"
        />
      </AdminPageShell>
    );
  }
}
