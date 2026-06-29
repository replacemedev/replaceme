import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminMfaChallengeForm } from "@/components/admin/auth/AdminMfaChallengeForm";
import { AuthPageShell, AuthFormCard } from "@/components/auth/AuthPageShell";
import { AUTH_SUBTITLE, AUTH_TITLE } from "@/lib/auth/ui-tokens";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "MFA Verification | Admin",
};

export default async function AdminMfaChallengePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (user.app_metadata?.role !== "admin") redirect("/403");

  const { data: aalData } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalData?.currentLevel === "aal2") {
    redirect("/admin/dashboard");
  }

  return (
    <AuthPageShell brandHref="/admin/dashboard">
      <header className="mb-6 space-y-2">
        <h1 className={AUTH_TITLE}>Two-factor authentication</h1>
        <p className={AUTH_SUBTITLE}>
          Enter the 6-digit code from your authenticator app to access the admin
          panel.
        </p>
      </header>
      <AuthFormCard>
        <AdminMfaChallengeForm />
      </AuthFormCard>
    </AuthPageShell>
  );
}
