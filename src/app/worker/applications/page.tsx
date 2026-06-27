import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getWorkerApplications,
  getWorkerApplicationStats,
} from "@/actions/worker/applications";
import { ApplicationsClient } from "@/components/worker/applications/ApplicationsClient";
import {
  WorkerPageShell,
  WorkerBreadcrumb,
  WorkerPageHeader,
} from "@/components/worker/layout";

export const metadata = {
  title: "My Applications | ReplaceMe",
  description: "Track your sent proposals and interview statuses.",
};

export const dynamic = "force-dynamic";

export default async function WorkerApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "worker") redirect("/login");

  const [applications, stats] = await Promise.all([
    getWorkerApplications(),
    getWorkerApplicationStats(),
  ]);

  return (
    <WorkerPageShell width="wide" className="py-8 gap-4">
      <WorkerBreadcrumb
        items={[
          { label: "Dashboard", href: "/worker/dashboard" },
          { label: "Applications" },
        ]}
      />
      <WorkerPageHeader
        title="My Applications"
        subhead="Track your sent proposals and interview statuses."
      />
      <ApplicationsClient applications={applications} stats={stats} />
    </WorkerPageShell>
  );
}
