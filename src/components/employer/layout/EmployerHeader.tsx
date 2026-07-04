import { getNavSession } from "@/lib/auth/nav-session";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { NavBrand } from "@/components/shared/nav/NavBrand";
import { GlobalHeaderActions } from "@/components/shared/header/GlobalHeader";
import { RoleNavDropdown } from "@/components/shared/nav/RoleNavDropdown";
import { EmployerHeaderNav } from "./EmployerHeaderNav";
import type { NavSession } from "@/types/nav";

interface EmployerHeaderProps {
  session?: NavSession;
}

export async function EmployerHeader({ session }: EmployerHeaderProps = {}) {
  const resolvedSession = session ?? (await getNavSession());
  const planUsage = await getEmployerPlanUsage();

  return (
    <header
      className="sticky top-0 w-full z-50 transition-all duration-300 bg-white border-b border-slate-100 shadow-sm"
      style={{ viewTransitionName: "employer-header" }}
    >
      <div className="relative flex justify-between items-center px-4 md:px-margin-desktop max-w-container-max mx-auto w-full h-16 gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <NavBrand homeHref={resolvedSession.homeHref} compact />
        </div>

        <EmployerHeaderNav
          unreadMessageCount={resolvedSession.unreadMessageCount}
          planUsage={planUsage}
          session={resolvedSession}
        />

        <GlobalHeaderActions session={resolvedSession} bellSize={22}>
          <RoleNavDropdown session={resolvedSession} planUsage={planUsage} />
        </GlobalHeaderActions>
      </div>
    </header>
  );
}
