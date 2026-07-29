import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkerSettingsClient } from "@/components/worker/settings/WorkerSettingsClient";
import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { EmailVerificationBanner } from "@/components/shared/settings/EmailVerificationBanner";
import { getEmailVerificationStatus } from "@/actions/auth";

export const metadata = {
  title: "Account Settings",
};

export const dynamic = "force-dynamic";

export default async function WorkerSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const [{ data: profile }, verification] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "availability, hourly_rate, is_remote, salary_currency, role, email"
      )
      .eq("id", user.id)
      .single(),
    getEmailVerificationStatus(),
  ]);

  if (!profile || profile.role !== "worker") redirect("/signin");

  return (
    <WorkerPageShell width="content">
      <WorkerPageHeader
        title="Account settings"
        subhead="View your login identity and manage availability."
      />
      <div className="mb-6">
        <EmailVerificationBanner
          email={verification.email}
          needsVerification={verification.needsVerification}
        />
      </div>
      <WorkerSettingsClient
        identity={{
          email: profile.email ?? user.email ?? null,
        }}
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
