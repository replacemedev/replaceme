import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkerSettingsClient } from "@/components/worker/settings/WorkerSettingsClient";
import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { EmailVerificationBanner } from "@/components/shared/settings/EmailVerificationBanner";
import { getEmailVerificationStatus } from "@/actions/auth";
import { getLatestDeletionRequestStatus } from "@/actions/privacy/deletion-request";

export const metadata = {
  title: "Account Settings | Replaceme",
};

export const dynamic = "force-dynamic";

export default async function WorkerSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const [{ data: profile }, verification, deletionStatus] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "availability, hourly_rate, is_remote, salary_currency, role, email, username"
      )
      .eq("id", user.id)
      .single(),
    getEmailVerificationStatus(),
    getLatestDeletionRequestStatus(),
  ]);

  if (!profile || profile.role !== "worker") redirect("/signin");

  return (
    <WorkerPageShell width="content">
      <WorkerPageHeader
        title="Account settings"
        subhead="View your login identity, manage availability, and submit trust & safety reports."
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
          username: profile.username ?? null,
        }}
        initial={{
          availability: profile.availability ?? "Full-time",
          hourlyRate: Number(profile.hourly_rate ?? 0),
          isRemote: Boolean(profile.is_remote),
          salaryCurrency: profile.salary_currency ?? "PHP",
        }}
        deletionStatus={deletionStatus}
      />
    </WorkerPageShell>
  );
}
