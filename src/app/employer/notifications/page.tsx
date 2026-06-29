import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchNotificationBootstrap } from "@/lib/notifications/fetch-initial";
import { EmployerNotificationsList } from "@/components/employer/notifications/EmployerNotificationsList";
import { EmployerPageShell } from "@/components/employer/layout";
import { ErrorState } from "@/components/shared/ErrorState";

export const metadata = {
  title: "Notifications | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function EmployerNotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "employer") {
    redirect("/employer/dashboard");
  }

  let bootstrap: Awaited<ReturnType<typeof fetchNotificationBootstrap>> | null =
    null;
  let loadError: string | null = null;

  try {
    bootstrap = await fetchNotificationBootstrap(user.id, 50);
  } catch (err) {
    loadError =
      err instanceof Error
        ? err.message
        : "We couldn't load notifications right now. Please refresh and try again.";
  }

  return (
    <EmployerPageShell width="content">
      {loadError || !bootstrap ? (
        <ErrorState
          description={loadError ?? "Failed to load notifications."}
          retryHref="/employer/notifications"
        />
      ) : (
        <EmployerNotificationsList
          notifications={bootstrap.notifications}
          unreadCount={bootstrap.unreadCount}
        />
      )}
    </EmployerPageShell>
  );
}
