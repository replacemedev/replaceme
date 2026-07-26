import type { NavSession } from "@/types/nav";
import { NotificationBellContainer } from "@/components/shared/header/NotificationBellContainer";
import { WORKER_NOTIFICATIONS_HREF } from "@/config/workerNav";
import { ADMIN_NOTIFICATIONS_HREF } from "@/config/adminNav";
import { EMPLOYER_NOTIFICATIONS_HREF } from "@/config/employerNav";

interface GlobalHeaderActionsProps {
  session: NavSession;
  children?: React.ReactNode;
  bellSize?: number;
  /** Override default role-based notifications href. Pass undefined to hide deep-link. */
  viewAllHref?: string;
  hideBell?: boolean;
}

/**
 * Server-composed header actions island: real-time notification bell + role dropdown slot.
 * Keeps initial notification fetch on the server; realtime subscription lives in the client bell.
 */
export async function GlobalHeaderActions({
  session,
  children,
  bellSize,
  viewAllHref,
  hideBell = false,
}: GlobalHeaderActionsProps) {
  if (!session.isAuthenticated || !session.userId) {
    return null;
  }

  const resolvedHref =
    viewAllHref !== undefined
      ? viewAllHref
      : session.role === "worker"
        ? WORKER_NOTIFICATIONS_HREF
        : session.role === "admin"
          ? ADMIN_NOTIFICATIONS_HREF
          : session.role === "employer"
            ? EMPLOYER_NOTIFICATIONS_HREF
            : undefined;

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {!hideBell ? (
        <NotificationBellContainer
          userId={session.userId}
          size={bellSize}
          viewAllHref={resolvedHref}
        />
      ) : null}
      {children}
    </div>
  );
}
