import React from "react";
import { getNavSession } from "@/lib/auth/nav-session";
import { NavBrand } from "@/components/shared/nav/NavBrand";
import { NotificationsBell } from "@/components/shared/nav/NotificationsBell";
import { WorkerDropdown } from "@/components/worker/layout/WorkerDropdown";
import { MobileTriggerAndMenu } from "./MobileTriggerAndMenu";
import { WorkerDesktopNav } from "./WorkerDesktopNav";

export async function WorkerHeader() {
  const [session] = await Promise.all([getNavSession()]);

  const profile = session.profile;
  const displayName = session.displayName || "Worker";
  const initials = session.initials || "W";

  return (
    <header className="sticky top-0 w-full z-50 transition-all duration-300 bg-white border-b border-slate-100 shadow-sm">
      <div className="flex justify-between items-center px-4 sm:px-8 max-w-7xl mx-auto w-full h-16">
        <div className="flex items-center gap-4">
          <MobileTriggerAndMenu />
          <NavBrand homeHref={session.homeHref} compact />
        </div>

        <WorkerDesktopNav />

        <div className="flex items-center gap-2 sm:gap-4">
          <NotificationsBell unreadCount={session.unreadMessageCount} />
          <WorkerDropdown
            profile={profile}
            displayName={displayName}
            initials={initials}
            isVerified={session.isVerified}
          />
        </div>
      </div>
    </header>
  );
}
