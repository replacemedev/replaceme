import { createClient } from "@/lib/supabase/server";
import {
  notificationSchema,
  type NotificationBootstrap,
} from "@/types/notifications.types";
import {
  CacheKeys,
  CACHE_TTL_SECONDS,
  getOrSet,
} from "@/lib/server/redis-cache";

const DEFAULT_LIMIT = 30;

async function loadNotificationBootstrap(
  userId: string,
  limit: number
): Promise<NotificationBootstrap> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select(
      "id, user_id, type, title, message, action_url, metadata, is_read, created_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load notifications: ${error.message}`);
  }

  const notifications = (data ?? [])
    .map((row) => notificationSchema.safeParse(row))
    .filter((result) => result.success)
    .map((result) => result.data);

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.is_read).length,
  };
}

export async function fetchNotificationBootstrap(
  userId: string,
  limit = DEFAULT_LIMIT
): Promise<NotificationBootstrap> {
  return getOrSet(
    CacheKeys.notificationsBootstrap(userId),
    CACHE_TTL_SECONDS.notifications,
    () => loadNotificationBootstrap(userId, limit)
  );
}
