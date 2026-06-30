import Link from "next/link";
import { AuthPageShell, AuthFormCard } from "@/components/auth/AuthPageShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { AuthMarketingPanel } from "@/components/auth/AuthMarketingPanel";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { AUTH_SUBTITLE, AUTH_TITLE } from "@/lib/auth/ui-tokens";
import { AUTH_STATIC_COPY } from "@/lib/content/auth-static";

export const metadata = {
  title: "Sign Up | ReplaceMe",
  description: "Create your ReplaceMe account.",
};

export default function SignUpPage() {
  const content = AUTH_STATIC_COPY.signup;

  return (
    <AuthPageShell
      marketing={
        <AuthMarketingPanel
          content={{
            headline: content.headlineMarketing,
            description: content.descriptionMarketing,
          }}
          variant="brand"
        />
      }
      marketingPosition="left"
      footer={<AuthFooter />}
    >
      <header className="mb-6 space-y-2 text-center lg:text-left">
        <h1 className={AUTH_TITLE}>{content.headline}</h1>
        <p className={AUTH_SUBTITLE}>{content.description}</p>
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
