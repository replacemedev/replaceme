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

interface RoleNavDropdownProps {
  session: NavSession;
  planUsage?: EmployerPlanUsage | null;
  layout?: "desktop" | "mobile";
}

/** Role-specific avatar dropdown — always renders when session is authenticated. */
export function RoleNavDropdown({
  session,
  planUsage = null,
  layout = "desktop",
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
    />
  );
}
