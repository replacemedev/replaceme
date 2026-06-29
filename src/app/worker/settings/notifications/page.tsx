import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNotificationPreferences } from "@/actions/worker/notification-preferences";
import { NotificationPreferencesClient } from "@/components/worker/settings/NotificationPreferencesClient";
import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";

export const metadata = { title: "Notification Preferences | ReplaceMe" };
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
        actions={
          <Link
            href="/worker/settings"
            className="text-sm font-bold text-[#006e2f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2 rounded-sm"
          >
            ← Account settings
          </Link>
        }
      />
      <NotificationPreferencesClient initial={prefs} />
    </WorkerPageShell>
  );
}
