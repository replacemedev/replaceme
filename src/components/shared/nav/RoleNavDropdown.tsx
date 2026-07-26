import { AdminDropdown } from "@/components/admin/layout/AdminDropdown";
import { EmployerDropdown } from "@/components/employer/layout/EmployerDropdown";
import { WorkerDropdown } from "@/components/worker/layout/WorkerDropdown";
import type { NavSession, UserRole } from "@/types/nav";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";

const ROLE_LABELS: Record<UserRole, { displayName: string; initials: string }> =
  {
    worker: { displayName: "Worker", initials: "W" },
    employer: { displayName: "Employer", initials: "E" },
    admin: { displayName: "Admin", initials: "A" },
  };

export type AdminDropdownLinks = {
  showDashboard?: boolean;
  showProfile?: boolean;
  dashboardHref?: string;
  profileHref?: string;
};

interface RoleNavDropdownProps {
  session: NavSession;
  planUsage?: EmployerPlanUsage | null;
  layout?: "desktop" | "mobile";
  adminLinks?: AdminDropdownLinks;
}

/** Role-specific avatar dropdown — always renders when session is authenticated. */
export function RoleNavDropdown({
  session,
  planUsage = null,
  layout = "desktop",
  adminLinks,
}: RoleNavDropdownProps) {
  if (!session.isAuthenticated || !session.role) return null;

  const fallback = ROLE_LABELS[session.role];
  const displayName = session.displayName || fallback.displayName;
  const initials = session.initials || fallback.initials;

  if (session.role === "worker") {
    return (
      <WorkerDropdown
        profile={session.profile}
        displayName={displayName}
        initials={initials}
        isVerified={session.isVerified}
        layout={layout}
      />
    );
  }

  if (session.role === "employer") {
    return (
      <EmployerDropdown
        profile={session.profile}
        displayName={displayName}
        initials={initials}
        planUsage={planUsage}
        layout={layout}
      />
    );
  }

  return (
    <AdminDropdown
      profile={session.profile}
      displayName={displayName}
      initials={initials}
      layout={layout}
      showDashboard={adminLinks?.showDashboard ?? true}
      showProfile={adminLinks?.showProfile ?? true}
      dashboardHref={adminLinks?.dashboardHref ?? "/admin/dashboard"}
      profileHref={adminLinks?.profileHref ?? "/admin/settings/profile"}
    />
  );
}
