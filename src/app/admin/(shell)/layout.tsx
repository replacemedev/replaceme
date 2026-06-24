import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (user.app_metadata?.role !== "admin") redirect("/403");

  const { data: aalData } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalData?.nextLevel === "aal2" && aalData?.currentLevel !== "aal2") {
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
