"use client";

import { NotificationBell } from "@/components/shared/header/NotificationBell";
import { RoleNavDropdown } from "@/components/shared/nav/RoleNavDropdown";
import type { NavSession } from "@/types/nav";

interface AuthenticatedNavActionsProps {
  session: NavSession;
}

export function AuthenticatedNavActions({ session }: AuthenticatedNavActionsProps) {
  if (!session.isAuthenticated || !session.userId) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <NotificationBell
        userId={session.userId}
        initialBootstrap={{ notifications: [], unreadCount: 0 }}
      />
      <RoleNavDropdown session={session} />
    </div>
  );
}
