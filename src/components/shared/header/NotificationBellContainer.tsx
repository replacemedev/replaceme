import { fetchNotificationBootstrap } from "@/lib/notifications/fetch-initial";
import { NotificationBell } from "@/components/shared/header/NotificationBell";
import type { NotificationBootstrap } from "@/types/notifications.types";

const EMPTY_BOOTSTRAP: NotificationBootstrap = {
  notifications: [],
  unreadCount: 0,
};

interface NotificationBellContainerProps {
  userId: string;
  size?: number;
  className?: string;
  viewAllHref?: string;
}

export async function NotificationBellContainer({
  userId,
  size,
  className,
  viewAllHref,
}: NotificationBellContainerProps) {
  let bootstrap = EMPTY_BOOTSTRAP;

  try {
    bootstrap = await fetchNotificationBootstrap(userId);
  } catch {
    bootstrap = EMPTY_BOOTSTRAP;
  }

  return (
    <NotificationBell
      userId={userId}
      initialBootstrap={bootstrap}
      size={size}
      className={className}
      viewAllHref={viewAllHref}
    />
  );
}
