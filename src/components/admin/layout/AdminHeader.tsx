import { getNavSession } from "@/lib/auth/nav-session";
import { NavBrand } from "@/components/shared/nav/NavBrand";
import { GlobalHeaderActions } from "@/components/shared/header/GlobalHeader";
import { RoleNavDropdown } from "@/components/shared/nav/RoleNavDropdown";
import { AdminMobileMenuButton } from "@/components/admin/layout/AdminMobileMenuButton";
import { AdminHeaderToolbar } from "@/components/admin/layout/AdminHeaderToolbar";
import type { NavSession } from "@/types/nav";

interface AdminHeaderProps {
  session?: NavSession;
}

export async function AdminHeader({ session }: AdminHeaderProps = {}) {
  const resolvedSession = session ?? (await getNavSession());

  return (
    <header className="sticky top-0 w-full z-50 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex justify-between items-center px-4 sm:px-8 max-w-7xl mx-auto h-16 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <AdminMobileMenuButton />
          <NavBrand homeHref={resolvedSession.homeHref} compact />
        </div>
        <GlobalHeaderActions session={resolvedSession}>
          <AdminHeaderToolbar />
          <RoleNavDropdown session={resolvedSession} />
        </GlobalHeaderActions>
      </div>
    </header>
  );
}
