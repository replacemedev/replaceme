import { getNavSession } from "@/lib/auth/nav-session";
import { NavBrand } from "@/components/shared/nav/NavBrand";
import { NotificationsBell } from "@/components/shared/nav/NotificationsBell";
import { EmployerDropdown } from "@/components/employer/layout/EmployerDropdown";
import { EmployerHeaderNav, EmployerMobileMenu } from "./EmployerHeaderNav";
import type { NavSession } from "@/types/nav";

interface EmployerHeaderProps {
  session?: NavSession;
}

export async function EmployerHeader({ session }: EmployerHeaderProps = {}) {
  const resolvedSession = session ?? (await getNavSession());

  return (
    <header className="sticky top-0 w-full z-50 transition-all duration-300 bg-white border-b border-slate-100 shadow-sm">
      <div className="relative flex justify-between items-center px-margin-desktop max-w-container-max mx-auto w-full h-16">
        <NavBrand homeHref={resolvedSession.homeHref} compact />

        <EmployerHeaderNav unreadMessageCount={resolvedSession.unreadMessageCount} />

        <div className="flex items-center gap-2 sm:gap-4">
          <NotificationsBell unreadCount={resolvedSession.unreadMessageCount} size={22} />
          {resolvedSession.profile && (
            <EmployerDropdown
              profile={resolvedSession.profile}
              displayName={resolvedSession.displayName}
              initials={resolvedSession.initials}
            />
          )}
          <EmployerMobileMenu unreadMessageCount={resolvedSession.unreadMessageCount} />
        </div>
      </div>
    </header>
  );
}
