import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNavSession } from "@/lib/auth/nav-session";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminLayoutChrome } from "@/components/admin/layout/AdminLayoutChrome";
import { AuthFlashToast } from "@/components/auth/AuthFlashToast";
import { ADMIN_MAIN_BG } from "@/lib/admin/ui-tokens";

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

  const session = await getNavSession();

  const sidebarProfile = {
    displayName: session.displayName,
    roleLabel: "Platform Admin",
    initials: session.initials,
    avatarUrl: session.profile?.avatar_url ?? null,
    homeHref: session.homeHref,
  };

  return (
    <AdminLayoutChrome profile={sidebarProfile}>
      <div className="min-h-screen bg-slate-50">
        <AuthFlashToast />
        <div className="flex min-h-screen">
          <AdminSidebar profile={sidebarProfile} />
          <div className="flex flex-1 flex-col min-w-0 min-h-screen">
            <AdminHeader session={session} />
            <main className={`flex-1 ${ADMIN_MAIN_BG}`}>{children}</main>
          </div>
        </div>
      </div>
    </AdminLayoutChrome>
  );
}
