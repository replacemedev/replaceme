import { redirect } from "next/navigation";
import { AuthPageShell, AuthFormCard } from "@/components/auth/AuthPageShell";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthMarketingPanel } from "@/components/auth/AuthMarketingPanel";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { RecoveryHashHandler } from "@/components/auth/RecoveryHashHandler";
import { AuthFlashToast } from "@/components/auth/AuthFlashToast";
import { AUTH_SUBTITLE, AUTH_TITLE } from "@/lib/auth/ui-tokens";
import { getAuthScreenContent } from "@/lib/content/auth-screen";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Update Password | Replaceme",
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

  const content = await getAuthScreenContent("auth-update-password");
  const headline = content.headline?.trim() || "Set a new password";
  const description =
    content.description?.trim() ||
    "Choose a strong password for your account.";

  return (
    <AuthPageShell
      centered={true}
      footer={<AuthFooter />}
    >
      <AuthFlashToast />

      <header className="space-y-2">
        <h1 className={AUTH_TITLE}>{headline}</h1>
        <p className={AUTH_SUBTITLE}>{description}</p>
      </header>

      <AuthFormCard>
        <RecoveryHashHandler />
        <UpdatePasswordForm />
      </AuthFormCard>
    </AuthPageShell>
  );
}
