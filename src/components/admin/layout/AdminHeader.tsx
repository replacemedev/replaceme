import { getNavSession } from "@/lib/auth/nav-session";
import { NavBrand } from "@/components/shared/nav/NavBrand";
import { GlobalHeaderActions } from "@/components/shared/header/GlobalHeader";
import { RoleNavDropdown } from "@/components/shared/nav/RoleNavDropdown";
import { AdminMobileMenuButton } from "@/components/admin/layout/AdminMobileMenuButton";
import type { NavSession } from "@/types/nav";
import type { AdminCapability } from "@/lib/admin/capabilities";
import { hasCapability } from "@/lib/admin/capabilities";
import { ADMIN_NOTIFICATIONS_HREF } from "@/config/adminNav";

interface AdminHeaderProps {
  session?: NavSession;
  capabilities?: readonly AdminCapability[];
  isSuperAdmin?: boolean;
}

export async function AdminHeader({
  session,
  capabilities = [],
  isSuperAdmin = false,
}: AdminHeaderProps = {}) {
  const resolvedSession = session ?? (await getNavSession());
  const showNotifications =
    isSuperAdmin || hasCapability(capabilities, "notifications");
  const showDashboard =
    isSuperAdmin || hasCapability(capabilities, "dashboard");
  const showProfile =
    isSuperAdmin || hasCapability(capabilities, "settings");

  return (
    <header className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm supports-[backdrop-filter]:bg-white/80">
      <div className="flex justify-between items-center px-4 md:px-margin-desktop max-w-[1600px] w-full mx-auto h-16 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <AdminMobileMenuButton />
          <NavBrand homeHref={resolvedSession.homeHref} compact />
        </div>
        <GlobalHeaderActions
          session={resolvedSession}
          viewAllHref={showNotifications ? ADMIN_NOTIFICATIONS_HREF : undefined}
          hideBell={!showNotifications}
        >
          <RoleNavDropdown
            session={resolvedSession}
            adminLinks={{
              showDashboard,
              showProfile,
              dashboardHref: "/admin/dashboard",
              profileHref: "/admin/settings/profile",
            }}
          />
        </GlobalHeaderActions>
      </div>
    </header>
  );
}
