import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const role = user.app_metadata?.role;
  if (role !== "admin") redirect("/login");

  // AAL2 enforcement: check MFA authenticator assurance level
  const { data: aalData } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  const currentLevel = aalData?.currentLevel;
  const nextLevel = aalData?.nextLevel;

  // If MFA is enrolled (nextLevel is aal2) but session is only aal1,
  // redirect to MFA challenge. If MFA not enrolled yet, allow aal1
  // during development phase — this will be enforced once TOTP is set up.
  if (nextLevel === "aal2" && currentLevel !== "aal2") {
    redirect("/admin/mfa-challenge");
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 bg-[#f8fafe] p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
