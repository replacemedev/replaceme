import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchNotificationBootstrap } from "@/lib/notifications/fetch-initial";
import { EmployerNotificationsClient } from "@/components/employer/notifications/EmployerNotificationsClient";
import { EmployerPageShell } from "@/components/employer/layout";

export const metadata = {
  title: "Notifications | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function EmployerNotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const bootstrap = await fetchNotificationBootstrap(user.id, 50);

  return (
    <EmployerPageShell width="content">
      <EmployerNotificationsClient
        userId={user.id}
        initialBootstrap={bootstrap}
      />
    </EmployerPageShell>
  );
}
