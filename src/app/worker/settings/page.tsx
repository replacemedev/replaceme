import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkerSettingsClient } from "@/components/worker/settings/WorkerSettingsClient";
import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";

export const metadata = {
  title: "Account Settings | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function WorkerSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("availability, hourly_rate, is_remote, salary_currency, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "worker") redirect("/signin");

  return (
    <WorkerPageShell width="content">
      <WorkerPageHeader
        title="Account settings"
        subhead="Manage availability, hourly rate, and trust & safety reports."
      />
      <WorkerSettingsClient
        initial={{
          availability: profile.availability ?? "Full-time",
          hourlyRate: Number(profile.hourly_rate ?? 0),
          isRemote: Boolean(profile.is_remote),
          salaryCurrency: profile.salary_currency ?? "PHP",
        }}
      />
    </WorkerPageShell>
  );
}
