import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { LoginTestimonial } from "@/components/auth/LoginTestimonial";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { AuthFlashToast } from "@/components/auth/AuthFlashToast";
import { createClient } from "@/lib/supabase/server";

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
    redirect("/login?view=forgot_password");
  }

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

        <h1 className="text-display-lg font-display-lg mb-2 font-bold text-slate-900">
          Set a new password
        </h1>
        <p className="text-body-base text-slate-600">
          Choose a strong password for your account.
        </p>
      </div>

      <div className="w-full rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <UpdatePasswordForm />
      </div>
    </AuthLayout>
  );
}
