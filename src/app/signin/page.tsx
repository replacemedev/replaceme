import Link from "next/link";
import { AuthPageShell, AuthFormCard } from "@/components/auth/AuthPageShell";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthMarketingPanel } from "@/components/auth/AuthMarketingPanel";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { AuthFlashToast } from "@/components/auth/AuthFlashToast";
import { AUTH_SUBTITLE, AUTH_TITLE } from "@/lib/auth/ui-tokens";
import { getAuthStaticContent } from "@/lib/content/auth-static";

export const metadata = {
  title: "Sign In | ReplaceMe",
  description: "Sign in to your ReplaceMe account.",
};

type SignInView = "login" | "forgot_password";

function resolveView(raw?: string): SignInView {
  return raw === "forgot_password" ? "forgot_password" : "login";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const view = resolveView(params.view);
  const content =
    view === "forgot_password"
      ? getAuthStaticContent("forgotPassword")
      : getAuthStaticContent("login");

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
        {view === "login" ? (
          <LoginForm forgotPasswordHref="/signin?view=forgot_password" />
        ) : (
          <ForgotPasswordForm />
        )}
      </AuthFormCard>

      {view === "login" && content.signupPrompt && content.signupLinkLabel ? (
        <p className="mt-4 text-center text-sm font-body-base text-slate-600 leading-relaxed">
          {content.signupPrompt}{" "}
          <Link
            href="/signup"
            className="font-body-bold font-bold text-[#006e2f] transition-colors hover:text-[#005321]"
          >
            {content.signupLinkLabel}
          </Link>
        </p>
      ) : null}
    </AuthPageShell>
  );
}
