import Link from "next/link";
import { getNavSession } from "@/lib/auth/nav-session";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { NavBrand } from "@/components/shared/nav/NavBrand";
import { GlobalHeaderActions } from "@/components/shared/header/GlobalHeader";
import { RoleNavDropdown } from "@/components/shared/nav/RoleNavDropdown";
import { PlanTierBadge } from "@/components/shared/billing/PlanTierBadge";
import { PlanUsageStrip } from "@/components/shared/entitlements/PlanUsageStrip";
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
      <div className="relative flex justify-between items-center px-margin-desktop max-w-container-max mx-auto w-full h-16 gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <NavBrand homeHref={resolvedSession.homeHref} compact />
          {planUsage ? (
            <span className="md:hidden flex items-center gap-2">
              <PlanTierBadge tier={planUsage.planSlug} />
              {planUsage.planSlug !== "scale" ? (
                <Link
                  href="/employer/pricing"
                  className="text-[10px] font-extrabold uppercase tracking-wide text-[#006e2f] hover:text-[#005c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2 rounded-sm"
                >
                  Upgrade
                </Link>
              ) : null}
            </span>
          ) : null}
        </div>

        <EmployerHeaderNav
          unreadMessageCount={resolvedSession.unreadMessageCount}
          planUsage={planUsage}
        />

        <GlobalHeaderActions session={resolvedSession} bellSize={22}>
          <RoleNavDropdown session={resolvedSession} />
        </GlobalHeaderActions>
      </div>

      {planUsage ? (
        <div className="hidden md:block border-t border-slate-100 bg-slate-50/60 px-margin-desktop py-2">
          <div className="max-w-container-max mx-auto w-full">
            <PlanUsageStrip usage={planUsage} compact />
          </div>
        </div>
      ) : null}
    </header>
  );
}
