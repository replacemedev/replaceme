import { getNavSession } from "@/lib/auth/nav-session";
import { NavBrand } from "@/components/shared/nav/NavBrand";
import { GlobalHeaderActions } from "@/components/shared/header/GlobalHeader";
import { RoleNavDropdown } from "@/components/shared/nav/RoleNavDropdown";
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

        <GlobalHeaderActions session={resolvedSession} bellSize={22}>
          <RoleNavDropdown session={resolvedSession} />
        </GlobalHeaderActions>
        <EmployerMobileMenu unreadMessageCount={resolvedSession.unreadMessageCount} />
      </div>
    </header>
  );
}
