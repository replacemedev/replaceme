import Image from "next/image";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginTestimonial } from "@/components/auth/LoginTestimonial";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { AuthFlashToast } from "@/components/auth/AuthFlashToast";

export const metadata = {
  title: "Sign In | ReplaceMe",
  description: "Sign in to your ReplaceMe account.",
};

type LoginView = "login" | "forgot_password";

function resolveView(raw?: string): LoginView {
  return raw === "forgot_password" ? "forgot_password" : "login";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const view = resolveView(params.view);

  return (
    <AuthLayout
      sidePanel={<LoginTestimonial />}
      sidePanelPosition="right"
      footer={<AuthFooter />}
    >
      <AuthFlashToast />

      <div className="mb-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 transition-opacity hover:opacity-90"
        >
          <div className="relative h-8 w-8">
            <Image
              src="/images/logo_favicon.png"
              alt="Replace Me"
              fill
              className="object-contain"
              sizes="32px"
            />
          </div>
          <span className="relative top-[-1px] font-display-md text-xl font-bold leading-none text-slate-900">
            Replace Me
          </span>
        </Link>

        {view === "login" ? (
          <>
            <h1 className="text-display-lg font-display-lg mb-2 font-bold text-slate-900">
              Welcome back
            </h1>
            <p className="text-body-base text-slate-600">
              Sign in to access your professional dashboard and manage your
              network.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-display-lg font-display-lg mb-2 font-bold text-slate-900">
              Reset password
            </h1>
            <p className="text-body-base text-slate-600">
              Enter your email and we&apos;ll send you a secure reset link.
            </p>
          </>
        )}
      </div>

      <div className="w-full rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {view === "login" ? (
          <LoginForm forgotPasswordHref="/login?view=forgot_password" />
        ) : (
          <ForgotPasswordForm />
        )}
      </div>

      {view === "login" ? (
        <p className="mt-4 text-center text-sm font-body-base text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-body-bold font-bold text-[#006e2f] transition-colors hover:text-[#005321]"
          >
            Sign up
          </Link>
        </p>
      ) : null}
    </AuthLayout>
  );
}
