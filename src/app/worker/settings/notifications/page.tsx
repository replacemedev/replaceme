import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNotificationPreferences } from "@/actions/worker/notification-preferences";
import { NotificationPreferencesClient } from "@/components/worker/settings/NotificationPreferencesClient";
import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";

export const metadata = { title: "Notification Preferences | Replaceme" };
export const dynamic = "force-dynamic";

export default async function WorkerNotificationPreferencesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const prefs = await getNotificationPreferences();

  return (
    <WorkerPageShell width="narrow">
      <WorkerPageHeader
        title="Notification preferences"
        subhead="Choose how you want to be notified about applications, messages, and offers."
      />
      <NotificationPreferencesClient initial={prefs} />
    </WorkerPageShell>
  );
}
