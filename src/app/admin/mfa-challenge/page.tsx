import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminMfaChallengeForm } from "@/components/admin/auth/AdminMfaChallengeForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "MFA Verification | Admin",
};

export default async function AdminMfaChallengePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (user.app_metadata?.role !== "admin") redirect("/403");

  const { data: aalData } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalData?.currentLevel === "aal2") {
    redirect("/admin/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f8fafe] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
        <h1 className="text-xl font-extrabold text-slate-900 mb-2">
          Two-factor authentication
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Enter the 6-digit code from your authenticator app to access the admin
          panel.
        </p>
        <AdminMfaChallengeForm />
      </div>
    </main>
  );
}
