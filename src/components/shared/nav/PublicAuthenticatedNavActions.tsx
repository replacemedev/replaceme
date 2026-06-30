"use client";

import Link from "next/link";
import { RoleNavDropdown } from "@/components/shared/nav/RoleNavDropdown";
import type { NavSession } from "@/types/nav";

interface PublicAuthenticatedNavActionsProps {
  session: NavSession;
  onNavigate?: () => void;
  layout?: "desktop" | "mobile";
}

export function PublicAuthenticatedNavActions({
  session,
  onNavigate,
  layout = "desktop",
}: PublicAuthenticatedNavActionsProps) {
  if (!session.isAuthenticated || !session.role) {
    return null;
  }

  const dashboardLink = (
    <Link
      href={session.homeHref}
      onClick={onNavigate}
      className={
        layout === "mobile"
          ? "bg-[#22c55e] text-white text-center py-2.5 rounded-xl font-body-bold text-sm transition-transform duration-200 hover:bg-[#16a34a] active:scale-[0.98]"
          : "bg-[#22c55e] text-white px-5 py-2 rounded-xl font-body-bold hover:bg-[#16a34a] transition-all duration-200 shadow-sm text-sm"
      }
    >
      Dashboard
    </Link>
  );

  if (layout === "mobile") {
    return (
      <div className="flex flex-col gap-2.5">
        {dashboardLink}
        <div className="flex justify-center">
          <RoleNavDropdown session={session} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {dashboardLink}
      <RoleNavDropdown session={session} />
    </div>
  );
}
