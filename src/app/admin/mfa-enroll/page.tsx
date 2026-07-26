import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminMfaEnrollForm } from "@/components/admin/auth/AdminMfaEnrollForm";
import { AuthPageShell, AuthFormCard } from "@/components/auth/AuthPageShell";
import { AUTH_SUBTITLE, AUTH_TITLE } from "@/lib/auth/ui-tokens";
import {
  isAdminMfaEnrolled,
  isAdminMfaSatisfied,
  MFA_CHALLENGE_PATH,
} from "@/lib/server/auth/admin-mfa";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Enroll MFA | Admin",
};

export default async function AdminMfaEnrollPage() {
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
  if (isAdminMfaEnrolled(aalData)) {
    redirect(MFA_CHALLENGE_PATH);
  }

  return (
    <AuthPageShell brandHref="/admin/dashboard" centered>
      <header className="mb-6 space-y-2 text-center">
        <h1 className={AUTH_TITLE}>Set up authenticator</h1>
        <p className={`${AUTH_SUBTITLE} mx-auto max-w-sm`}>
          Admin access requires a TOTP authenticator app. Enroll once, then
          verify on each elevated session.
        </p>
      </header>
      <AuthFormCard>
        <AdminMfaEnrollForm />
      </AuthFormCard>
    </AuthPageShell>
  );
}
