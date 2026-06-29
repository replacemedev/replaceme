import Link from "next/link";
import { AuthPageShell, AuthFormCard } from "@/components/auth/AuthPageShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { AuthMarketingPanel } from "@/components/auth/AuthMarketingPanel";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { AUTH_SUBTITLE, AUTH_TITLE } from "@/lib/auth/ui-tokens";
import { getAuthScreenContent } from "@/lib/content/auth-screen";

export const metadata = {
  title: "Sign Up | ReplaceMe",
  description: "Create your ReplaceMe account.",
};

export default async function SignUpPage() {
  const content = await getAuthScreenContent("auth-signup");

  const headline = content.headline?.trim() || "Create your account";
  const description =
    content.description?.trim() ||
    "Join the premier professional marketplace.";

  return (
    <AuthPageShell
      marketing={<AuthMarketingPanel content={content} variant="brand" />}
      marketingPosition="left"
      footer={<AuthFooter />}
    >
      <header className="mb-6 space-y-2 text-center lg:text-left">
        <h1 className={AUTH_TITLE}>{headline}</h1>
        <p className={AUTH_SUBTITLE}>{description}</p>
      </header>

      <AuthFormCard>
        <SignUpForm />

        {content.signupPrompt && content.signupLinkLabel ? (
          <div className="mt-6 text-center">
            <p className="text-sm font-body-base text-slate-600 leading-relaxed">
              {content.signupPrompt}{" "}
              <Link
                href="/signin"
                className="font-body-bold font-bold text-[#006e2f] transition-colors hover:text-[#005321]"
              >
                {content.signupLinkLabel}
              </Link>
            </p>
          </div>
        ) : null}
      </AuthFormCard>
    </AuthPageShell>
  );
}
