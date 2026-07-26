import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminMfaChallengeForm } from "@/components/admin/auth/AdminMfaChallengeForm";
import { AuthPageShell, AuthFormCard } from "@/components/auth/AuthPageShell";
import { AUTH_SUBTITLE, AUTH_TITLE } from "@/lib/auth/ui-tokens";
import {
  isAdminMfaEnrolled,
  isAdminMfaSatisfied,
  MFA_ENROLL_PATH,
} from "@/lib/server/auth/admin-mfa";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "MFA Verification | Admin",
};

export default async function AdminMfaChallengePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");
  if (user.app_metadata?.role !== "admin") redirect("/403");

  const { data: aalData } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (isAdminMfaSatisfied(aalData)) {
    redirect("/admin/dashboard");
  }
  if (!isAdminMfaEnrolled(aalData)) {
    redirect(MFA_ENROLL_PATH);
  }

  return (
    <AuthPageShell brandHref="/admin/dashboard" centered>
      <header className="mb-6 space-y-2 text-center">
        <h1 className={AUTH_TITLE}>Two-factor authentication</h1>
        <p className={`${AUTH_SUBTITLE} mx-auto max-w-sm`}>
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
