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

    // #region agent log
    fetch("http://127.0.0.1:7616/ingest/92da0cf0-b581-4b9a-8f33-a2958a515450", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "6b02a8",
      },
      body: JSON.stringify({
        sessionId: "6b02a8",
        runId: "pre-fix",
        hypothesisId: "A-B",
        location: "admin/notifications/page.tsx:fetch",
        message: "server bootstrap loaded",
        data: {
          userId: user.id,
          hasNotifications: Array.isArray(bootstrap?.notifications),
          notificationsLength: Array.isArray(bootstrap?.notifications)
            ? bootstrap.notifications.length
            : null,
          unreadCount: bootstrap?.unreadCount,
          bootstrapKeys: bootstrap ? Object.keys(bootstrap) : null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    return (
      <AdminPageShell>
        <AdminNotificationsClient userId={user.id} initialBootstrap={bootstrap} />
      </AdminPageShell>
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to load notifications.";

    // #region agent log
    fetch("http://127.0.0.1:7616/ingest/92da0cf0-b581-4b9a-8f33-a2958a515450", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "6b02a8",
      },
      body: JSON.stringify({
        sessionId: "6b02a8",
        runId: "pre-fix",
        hypothesisId: "B",
        location: "admin/notifications/page.tsx:catch",
        message: "server fetch threw",
        data: {
          errorMessage: message,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

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
