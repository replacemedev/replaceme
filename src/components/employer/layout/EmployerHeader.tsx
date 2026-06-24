import { getNavSession } from "@/lib/auth/nav-session";
import { NavBrand } from "@/components/shared/nav/NavBrand";
import { NotificationsBell } from "@/components/shared/nav/NotificationsBell";
import { EmployerDropdown } from "@/components/employer/layout/EmployerDropdown";
import { EmployerHeaderNav, EmployerMobileMenu } from "./EmployerHeaderNav";

export async function EmployerHeader() {
  const session = await getNavSession();

  return (
    <header className="sticky top-0 w-full z-50 transition-all duration-300 bg-white border-b border-slate-100 shadow-sm">
      <div className="relative flex justify-between items-center px-margin-desktop max-w-container-max mx-auto w-full h-16">
        <NavBrand homeHref={session.homeHref} compact />

        <EmployerHeaderNav unreadMessageCount={session.unreadMessageCount} />

        <div className="flex items-center gap-2 sm:gap-4">
          <NotificationsBell unreadCount={session.unreadMessageCount} size={22} />
          {session.profile && (
            <EmployerDropdown
              profile={session.profile}
              displayName={session.displayName}
              initials={session.initials}
            />
          )}
          <EmployerMobileMenu unreadMessageCount={session.unreadMessageCount} />
        </div>
      </div>
    </header>
  );
}
