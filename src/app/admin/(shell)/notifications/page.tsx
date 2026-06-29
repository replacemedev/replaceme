import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPageShell } from "@/components/admin/layout";
import { fetchNotificationBootstrap } from "@/lib/notifications/fetch-initial";
import { AdminNotificationsClient } from "@/components/admin/notifications/AdminNotificationsClient";

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

  const bootstrap = await fetchNotificationBootstrap(user.id, 50);

  return (
    <AdminPageShell>
      <AdminNotificationsClient userId={user.id} initialBootstrap={bootstrap} />
    </AdminPageShell>
  );
}
