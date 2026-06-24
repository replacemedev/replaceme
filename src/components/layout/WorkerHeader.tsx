import React from "react";
import { getNavSession } from "@/lib/auth/nav-session";
import { NavBrand } from "@/components/shared/nav/NavBrand";
import { GlobalHeaderActions } from "@/components/shared/header/GlobalHeader";
import { WorkerDropdown } from "@/components/worker/layout/WorkerDropdown";
import { MobileTriggerAndMenu } from "./MobileTriggerAndMenu";
import { WorkerDesktopNav } from "./WorkerDesktopNav";
import type { NavSession } from "@/types/nav";

interface WorkerHeaderProps {
  session?: NavSession;
}

export async function WorkerHeader({ session }: WorkerHeaderProps = {}) {
  const resolvedSession = session ?? (await getNavSession());

  const profile = resolvedSession.profile;
  const displayName = resolvedSession.displayName || "Worker";
  const initials = resolvedSession.initials || "W";

  return (
    <header className="sticky top-0 w-full z-50 transition-all duration-300 bg-white border-b border-slate-100 shadow-sm">
      <div className="flex justify-between items-center px-4 sm:px-8 max-w-7xl mx-auto w-full h-16">
        <div className="flex items-center gap-4">
          <MobileTriggerAndMenu />
          <NavBrand homeHref={resolvedSession.homeHref} compact />
        </div>

        <WorkerDesktopNav />

        <GlobalHeaderActions session={resolvedSession}>
          <WorkerDropdown
            profile={profile}
            displayName={displayName}
            initials={initials}
            isVerified={resolvedSession.isVerified}
          />
        </GlobalHeaderActions>
      </div>
    </header>
  );
}
