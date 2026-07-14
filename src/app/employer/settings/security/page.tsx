import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  EmployerPageShell,
  EmployerPageHeader,
} from "@/components/employer/layout";
import { SessionSecurityPanel } from "@/components/shared/security/SessionSecurityPanel";

export const metadata = {
  title: "Security | Replaceme",
  description: "Manage sessions and sign out of other devices.",
};

export const dynamic = "force-dynamic";

export default async function EmployerSecuritySettingsPage() {
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

  if (profile?.role !== "employer") redirect("/signin");

  return (
    <EmployerPageShell width="content">
      <EmployerPageHeader
        title="Security"
        subhead="Protect your hiring account by managing active sessions."
      />
      <p className="mb-6 text-sm">
        <Link
          href="/employer/settings/account"
          className="font-bold text-[#006e2f] hover:underline"
        >
          ← Account settings
        </Link>
      </p>
      <div className="mx-auto w-full max-w-2xl">
        <SessionSecurityPanel />
      </div>
    </EmployerPageShell>
  );
}
