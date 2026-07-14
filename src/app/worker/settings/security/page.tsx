import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { SessionSecurityPanel } from "@/components/shared/security/SessionSecurityPanel";

export const metadata = {
  title: "Security | Replaceme",
  description: "Manage sessions and sign out of other devices.",
};

export const dynamic = "force-dynamic";

export default async function WorkerSecuritySettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "worker") redirect("/signin");

  return (
    <WorkerPageShell width="content">
      <WorkerPageHeader
        title="Security"
        subhead="Protect your account by managing where you are signed in."
      />
      <p className="mb-6 text-sm">
        <Link
          href="/worker/settings"
          className="font-bold text-[#006e2f] hover:underline"
        >
          ← Account settings
        </Link>
      </p>
      <div className="mx-auto w-full max-w-2xl">
        <SessionSecurityPanel />
      </div>
    </WorkerPageShell>
  );
}
