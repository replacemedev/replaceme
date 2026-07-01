import Link from "next/link";
import { AuthPageShell, AuthFormCard } from "@/components/auth/AuthPageShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { SignUpRoleCrossLink } from "@/components/auth/SignUpRoleCrossLink";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { SignUpBrandPanel } from "@/components/auth/marketing/SignUpBrandPanel";
import { AUTH_LINK, AUTH_SUBTITLE, AUTH_TITLE } from "@/lib/auth/ui-tokens";
import { SIGNUP_PAGE, SIGNUP_WORKER_PAGE } from "@/lib/auth/static-copy";
import { buildAuthHref, parseGuestCallbackUrl } from "@/lib/auth/safe-callback-url";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign Up as Worker | ReplaceMe",
  description: "Create your ReplaceMe worker account.",
};

export default async function WorkerSignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = parseGuestCallbackUrl(params.callbackUrl) ?? undefined;
  const employerHref = buildAuthHref("/signup/employer", callbackUrl ?? "");

  return (
    <AuthPageShell
      marketing={<SignUpBrandPanel />}
      marketingPosition="left"
      footer={<AuthFooter />}
    >
      <header className="mb-6 space-y-2 text-center lg:text-left">
        <h1 className={AUTH_TITLE}>{SIGNUP_WORKER_PAGE.headline}</h1>
        <p className={AUTH_SUBTITLE}>{SIGNUP_WORKER_PAGE.description}</p>
      </header>

      <AuthFormCard>
        <SignUpRoleCrossLink
          prompt={SIGNUP_WORKER_PAGE.crossRolePrompt}
          linkLabel={SIGNUP_WORKER_PAGE.crossRoleLinkLabel}
          href={callbackUrl ? employerHref : "/signup/employer"}
        />

        <SignUpForm
          role="worker"
          callbackUrl={callbackUrl}
          submitLabel={SIGNUP_WORKER_PAGE.submitLabel}
        />

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
