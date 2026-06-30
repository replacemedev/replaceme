import { redirect } from "next/navigation";
import { AuthPageShell, AuthFormCard } from "@/components/auth/AuthPageShell";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthMarketingPanel } from "@/components/auth/AuthMarketingPanel";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { RecoveryHashHandler } from "@/components/auth/RecoveryHashHandler";
import { AuthFlashToast } from "@/components/auth/AuthFlashToast";
import { AUTH_SUBTITLE, AUTH_TITLE } from "@/lib/auth/ui-tokens";
import { getAuthStaticContent } from "@/lib/content/auth-static";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Update Password | ReplaceMe",
  description: "Set a new password for your ReplaceMe account.",
};

export default async function UpdatePasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?view=forgot_password");
  }

  const content = getAuthStaticContent("updatePassword");

  return (
    <AuthPageShell
      marketing={<AuthMarketingPanel content={content} variant="testimonial" />}
      marketingPosition="right"
      footer={<AuthFooter />}
    >
      <AuthFlashToast />

      <header className="mb-6 space-y-2">
        <h1 className={AUTH_TITLE}>{content.headline}</h1>
        <p className={AUTH_SUBTITLE}>{content.description}</p>
      </header>

      <AuthFormCard>
        <RecoveryHashHandler />
        <UpdatePasswordForm />
      </AuthFormCard>
    </AuthPageShell>
  );
}
