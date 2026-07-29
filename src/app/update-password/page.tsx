import { redirect } from "next/navigation";
import { AuthPageShell, AuthFormCard } from "@/components/auth/AuthPageShell";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { RecoveryHashHandler } from "@/components/auth/RecoveryHashHandler";
import { AuthFlashToast } from "@/components/auth/AuthFlashToast";
import { AUTH_SUBTITLE, AUTH_TITLE } from "@/lib/auth/ui-tokens";
import { UPDATE_PASSWORD_PAGE } from "@/lib/data/publicPages";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Update Password",
  description: "Set a new password for your Replaceme account.",
};

export default async function UpdatePasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?view=forgot_password");
  }

  return (
    <AuthPageShell centered={true} footer={<AuthFooter />}>
      <AuthFlashToast />

      <header className="space-y-2">
        <h1 className={AUTH_TITLE}>{UPDATE_PASSWORD_PAGE.headline}</h1>
        <p className={AUTH_SUBTITLE}>{UPDATE_PASSWORD_PAGE.description}</p>
      </header>

      <AuthFormCard>
        <RecoveryHashHandler />
        <UpdatePasswordForm />
      </AuthFormCard>
    </AuthPageShell>
  );
}
