import { getNavSession } from "@/lib/auth/nav-session";
import { NavBrand } from "@/components/shared/nav/NavBrand";
import { GlobalHeaderActions } from "@/components/shared/header/GlobalHeader";
import { AdminDropdown } from "./AdminDropdown";
import type { NavSession } from "@/types/nav";

interface AdminHeaderProps {
  session?: NavSession;
}

export async function AdminHeader({ session }: AdminHeaderProps = {}) {
  const resolvedSession = session ?? (await getNavSession());

  return (
    <header className="sticky top-0 w-full z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="flex justify-between items-center px-4 sm:px-8 max-w-7xl mx-auto h-16">
        <NavBrand homeHref={resolvedSession.homeHref} compact />
        <GlobalHeaderActions session={resolvedSession}>
          {resolvedSession.profile ? (
            <AdminDropdown
              profile={resolvedSession.profile}
              displayName={resolvedSession.displayName}
              initials={resolvedSession.initials}
            />
          ) : null}
        </GlobalHeaderActions>
      </div>
    </header>
  );
}
