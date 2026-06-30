import Link from "next/link";
import { AuthPageShell, AuthFormCard } from "@/components/auth/AuthPageShell";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { LoginForm } from "@/components/auth/LoginForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { AuthFlashToast } from "@/components/auth/AuthFlashToast";
import { SignInWelcomePanel } from "@/components/auth/marketing/SignInWelcomePanel";
import { AUTH_LINK, AUTH_SUBTITLE, AUTH_TITLE } from "@/lib/auth/ui-tokens";
import { SIGNIN_PAGE } from "@/lib/auth/static-copy";
import { parseGuestCallbackUrl } from "@/lib/auth/safe-callback-url";

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
  searchParams: Promise<{ view?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const view = resolveView(params.view);
  const callbackUrl = parseGuestCallbackUrl(params.callbackUrl) ?? undefined;
  const copy =
    view === "login" ? SIGNIN_PAGE.login : SIGNIN_PAGE.forgotPassword;

  return (
    <AuthPageShell
      marketing={view === "login" ? <SignInWelcomePanel /> : undefined}
      marketingPosition="right"
      footer={<AuthFooter />}
    >
      <AuthFlashToast />

      <header className="mb-6 space-y-2">
        <h1 className={AUTH_TITLE}>{copy.headline}</h1>
        <p className={AUTH_SUBTITLE}>{copy.description}</p>
      </header>

      <AuthFormCard>
        {view === "login" ? (
          <LoginForm
            forgotPasswordHref="/signin?view=forgot_password"
            callbackUrl={callbackUrl}
          />
        ) : (
          <ForgotPasswordForm />
        )}
      </AuthFormCard>

      {view === "login" ? (
        <p className="mt-4 text-center text-sm font-body-base text-slate-600 leading-relaxed">
          {SIGNIN_PAGE.login.signUpPrompt}{" "}
          <Link
            href={
              callbackUrl
                ? `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : "/signup"
            }
            className={AUTH_LINK}
          >
            {SIGNIN_PAGE.login.signUpLinkLabel}
          </Link>
        </p>
      ) : null}
    </AuthPageShell>
  );
}
