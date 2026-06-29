import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchNotificationBootstrap } from "@/lib/notifications/fetch-initial";
import { EmployerNotificationsClient } from "@/components/employer/notifications/EmployerNotificationsClient";
import { EmployerPageShell, EmployerBreadcrumb } from "@/components/employer/layout";
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

  let bootstrap: Awaited<ReturnType<typeof fetchNotificationBootstrap>> | null =
    null;
  let loadError: string | null = null;

  try {
    bootstrap = await fetchNotificationBootstrap(user.id, 50);
  } catch {
    loadError =
      "We couldn't load notifications right now. Please refresh and try again.";
  }

  return (
    <EmployerPageShell width="content">
      <EmployerBreadcrumb
        items={[
          { label: "Dashboard", href: "/employer/dashboard" },
          { label: "Notifications" },
        ]}
      />
      {loadError || !bootstrap ? (
        <ErrorState description={loadError ?? "Failed to load notifications."} retryHref="/employer/notifications" />
      ) : (
        <EmployerNotificationsClient
          userId={user.id}
          initialBootstrap={bootstrap}
        />
      )}
    </EmployerPageShell>
  );
}
