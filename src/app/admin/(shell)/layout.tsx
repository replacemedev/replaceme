import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNavSession } from "@/lib/auth/nav-session";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminLayoutChrome } from "@/components/admin/layout/AdminLayoutChrome";
import { AuthFlashToast } from "@/components/auth/AuthFlashToast";
import { ADMIN_MAIN_BG } from "@/lib/admin/ui-tokens";
import { resolveAdminMfaRedirect } from "@/lib/server/auth/admin-mfa";
import { getCurrentAdminCapabilities } from "@/lib/server/auth/require-capability";
import { ensureAdminAppMetadataSynced } from "@/lib/admin/sync-admin-app-metadata";

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

  if (!user) redirect("/signin");

  if (user.app_metadata?.role !== "admin") redirect("/403");

  const { data: aalData } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const mfaRedirect = resolveAdminMfaRedirect(aalData);
  if (mfaRedirect) redirect(mfaRedirect);

  const session = await getNavSession();
  const { isSuperAdmin, capabilities, adminRole } =
    await getCurrentAdminCapabilities();

  const synced = await ensureAdminAppMetadataSynced(user, {
    adminRole,
    capabilities,
  });
  if (synced) {
    await supabase.auth.refreshSession();
  }

  const sidebarProfile = {
    displayName: session.displayName,
    roleLabel: isSuperAdmin ? "Super admin" : "Moderator",
    initials: session.initials,
    avatarUrl: session.profile?.avatar_url ?? null,
    homeHref: session.homeHref,
  };

  return (
    <AdminLayoutChrome
      profile={sidebarProfile}
      isSuperAdmin={isSuperAdmin}
      capabilities={capabilities}
      adminRole={adminRole}
    >
      <div className="min-h-screen bg-slate-50 w-full max-w-[100vw] overflow-x-hidden">
        <AuthFlashToast />
        <div className="flex min-h-screen">
          <AdminSidebar
            profile={sidebarProfile}
            isSuperAdmin={isSuperAdmin}
            capabilities={capabilities}
          />
          <div className="flex flex-1 flex-col min-w-0 min-h-screen w-full relative z-20">
            <AdminHeader
              session={session}
              capabilities={capabilities}
              isSuperAdmin={isSuperAdmin}
            />
            <main className={`flex-1 w-full min-w-0 overflow-x-hidden ${ADMIN_MAIN_BG}`}>{children}</main>
          </div>
        </div>
      </div>
    </AdminLayoutChrome>
  );
}
