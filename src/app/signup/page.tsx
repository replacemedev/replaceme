import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { AuthAnimatedSidebar } from "@/components/auth/AuthAnimatedSidebar";
import { AuthFooter } from "@/components/auth/AuthFooter";
import Image from "next/image";
import Link from "next/link";
import { getAuthScreenContent } from "@/lib/content/auth-screen";

export default async function SignUpPage() {
  const content = await getAuthScreenContent("auth-signup");

  return (
    <AuthLayout
      sidePanel={<AuthAnimatedSidebar />}
      sidePanelPosition="left"
      footer={<AuthFooter />}
    >
      <div className="mb-4 flex flex-col items-center">
        <Link
          href="/"
          className="mb-2 inline-flex select-none items-center gap-2 transition-opacity hover:opacity-90"
        >
          <div className="relative h-8 w-8">
            <Image
              src="/images/logo_favicon.png"
              alt="Replace Me"
              fill
              className="object-contain"
              sizes="32px"
              priority
            />
          </div>
          <span className="relative top-[-1px] font-display-md text-xl font-bold leading-none text-slate-900">
            {content.headline}
          </span>
        </Link>
        <p className="mb-0 text-center text-body-base text-sm text-slate-500 md:text-base">
          {content.description}
        </p>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:p-8">
        <SignUpForm />

        {content.signupPrompt && content.signupLinkLabel ? (
          <div className="mt-6 text-center">
            <p className="text-sm font-body-base text-slate-600">
              {content.signupPrompt}{" "}
              <Link
                href="/login"
                className="font-body-bold font-bold text-[#006e2f] transition-colors hover:text-[#005321]"
              >
                {content.signupLinkLabel}
              </Link>
            </p>
          </div>
        ) : null}
      </div>
    </AuthLayout>
  );
}
