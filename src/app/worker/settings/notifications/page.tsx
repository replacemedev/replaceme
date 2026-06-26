import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNotificationPreferences } from "@/actions/worker/notification-preferences";
import { NotificationPreferencesClient } from "@/components/worker/settings/NotificationPreferencesClient";

export const metadata = { title: "Notification Preferences | ReplaceMe" };
export const dynamic = "force-dynamic";

export default async function WorkerNotificationPreferencesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const prefs = await getNotificationPreferences();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10">
      <Link
        href="/worker/settings"
        className="text-sm font-bold text-[#006e2f] hover:underline"
      >
        ← Account settings
      </Link>
      <h1 className="text-2xl font-extrabold text-slate-900 mt-4">
        Notification preferences
      </h1>
      <p className="text-sm text-slate-500 mt-1 mb-8">
        Choose how you want to be notified about applications, messages, and offers.
      </p>
      <NotificationPreferencesClient initial={prefs} />
    </div>
  );
}
