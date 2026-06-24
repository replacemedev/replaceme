import Image from "next/image";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginTestimonial } from "@/components/auth/LoginTestimonial";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { VerifyCodeForm } from "@/components/auth/VerifyCodeForm";

export const metadata = {
  title: "Sign In | ReplaceMe",
  description: "Sign in to your ReplaceMe account.",
};

type LoginView = "login" | "forgot_password" | "verify_code";

function resolveView(raw?: string): LoginView {
  if (raw === "forgot_password" || raw === "verify_code") return raw;
  return "login";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; email?: string }>;
}) {
  const params = await searchParams;
  const view = resolveView(params.view);
  const resetEmail = params.email ?? "";

  return (
    <AuthLayout
      sidePanel={<LoginTestimonial />}
      sidePanelPosition="right"
      footer={<AuthFooter />}
    >
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-4 hover:opacity-90 transition-opacity"
        >
          <div className="relative w-8 h-8">
            <Image
              src="/images/logo_favicon.png"
              alt="Replace Me"
              fill
              className="object-contain"
              sizes="32px"
            />
          </div>
          <span className="font-display-md font-bold text-xl text-slate-900 leading-none relative top-[-1px]">
            Replace Me
          </span>
        </Link>

        {view === "login" && (
          <>
            <h1 className="text-display-lg font-display-lg font-bold text-slate-900 mb-2">
              Welcome back
            </h1>
            <p className="text-body-base text-slate-600">
              Sign in to access your professional dashboard and manage your
              network.
            </p>
          </>
        )}

        {view === "forgot_password" && (
          <>
            <h1 className="text-display-lg font-display-lg font-bold text-slate-900 mb-2">
              Reset password
            </h1>
            <p className="text-body-base text-slate-600">
              Enter your email and we&apos;ll send you a 6-digit verification
              code.
            </p>
          </>
        )}

        {view === "verify_code" && (
          <>
            <h1 className="text-display-lg font-display-lg font-bold text-slate-900 mb-2">
              Verify security code
            </h1>
            <p className="text-body-base text-slate-600">
              Enter the code sent to your email to reset your password.
            </p>
          </>
        )}
      </div>

      <div className="w-full bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        {view === "login" && (
          <LoginForm forgotPasswordHref="/login?view=forgot_password" />
        )}
        {view === "forgot_password" && <ForgotPasswordForm />}
        {view === "verify_code" && resetEmail && (
          <VerifyCodeForm email={resetEmail} />
        )}
        {view === "verify_code" && !resetEmail && (
          <p className="text-sm text-slate-500 text-center">
            Missing email context.{" "}
            <Link
              href="/login?view=forgot_password"
              className="font-bold text-[#006e2f] hover:text-[#005321]"
            >
              Request a new code
            </Link>
          </p>
        )}
      </div>

      {view === "login" && (
        <p className="mt-4 text-center text-sm font-body-base text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-body-bold font-bold text-[#006e2f] hover:text-[#005321] transition-colors"
          >
            Sign up
          </Link>
        </p>
      )}
    </AuthLayout>
  );
}
