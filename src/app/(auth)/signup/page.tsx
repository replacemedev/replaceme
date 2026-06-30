import Link from "next/link";
import { AuthPageShell, AuthFormCard } from "@/components/auth/AuthPageShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { SignUpBrandPanel } from "@/components/auth/marketing/SignUpBrandPanel";
import { AUTH_LINK, AUTH_SUBTITLE, AUTH_TITLE } from "@/lib/auth/ui-tokens";
import { SIGNUP_PAGE } from "@/lib/auth/static-copy";
import { parseGuestCallbackUrl } from "@/lib/auth/safe-callback-url";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign Up | ReplaceMe",
  description: "Create your ReplaceMe account.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = parseGuestCallbackUrl(params.callbackUrl) ?? undefined;

  return (
    <AuthPageShell
      marketing={<SignUpBrandPanel />}
      marketingPosition="left"
      footer={<AuthFooter />}
    >
      <header className="mb-6 space-y-2 text-center lg:text-left">
        <h1 className={AUTH_TITLE}>{SIGNUP_PAGE.headline}</h1>
        <p className={AUTH_SUBTITLE}>{SIGNUP_PAGE.description}</p>
      </header>

      <AuthFormCard>
        <SignUpForm callbackUrl={callbackUrl} />

        <div className="mt-6 text-center">
          <p className="text-sm font-body-base text-slate-600 leading-relaxed">
            {SIGNUP_PAGE.signInPrompt}{" "}
            <Link
              href={
                callbackUrl
                  ? `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
                  : "/signin"
              }
              className={AUTH_LINK}
            >
              {SIGNUP_PAGE.signInLinkLabel}
            </Link>
          </p>
        </div>
      </AuthFormCard>
    </AuthPageShell>
  );
}
