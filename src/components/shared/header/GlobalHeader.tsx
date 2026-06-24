import type { NavSession } from "@/types/nav";
import { NotificationBellContainer } from "@/components/shared/header/NotificationBellContainer";

interface GlobalHeaderActionsProps {
  session: NavSession;
  children?: React.ReactNode;
  bellSize?: number;
}

/**
 * Server-composed header actions island: real-time notification bell + role dropdown slot.
 * Keeps initial notification fetch on the server; realtime subscription lives in the client bell.
 */
export async function GlobalHeaderActions({
  session,
  children,
  bellSize,
}: GlobalHeaderActionsProps) {
  if (!session.isAuthenticated || !session.userId) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <NotificationBellContainer userId={session.userId} size={bellSize} />
      {children}
    </div>
  );
}
