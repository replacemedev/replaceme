"use client";

import { WorkerDropdown } from "@/components/worker/layout/WorkerDropdown";
import { EmployerDropdown } from "@/components/employer/layout/EmployerDropdown";
import { AdminDropdown } from "@/components/admin/layout/AdminDropdown";
import { NotificationsBell } from "./NotificationsBell";
import type { NavSession } from "@/types/nav";

interface AuthenticatedNavActionsProps {
  session: NavSession;
}

export function AuthenticatedNavActions({ session }: AuthenticatedNavActionsProps) {
  if (!session.isAuthenticated || !session.role || !session.profile) {
    return null;
  }

  const profile = session.profile;

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <NotificationsBell unreadCount={session.unreadMessageCount} />

      {session.role === "worker" && (
        <WorkerDropdown
          profile={profile}
          displayName={session.displayName}
          initials={session.initials}
          isVerified={session.isVerified}
        />
      )}

      {session.role === "employer" && (
        <EmployerDropdown
          profile={profile}
          displayName={session.displayName}
          initials={session.initials}
        />
      )}

      {session.role === "admin" && (
        <AdminDropdown
          profile={profile}
          displayName={session.displayName}
          initials={session.initials}
        />
      )}
    </div>
  );
}
