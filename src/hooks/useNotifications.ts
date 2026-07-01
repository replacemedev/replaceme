"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  notificationSchema,
  type Notification,
  type NotificationBootstrap,
} from "@/types/notifications.types";

const NOTIFICATION_LIMIT = 30;

function parseNotificationRow(row: unknown): Notification | null {
  const parsed = notificationSchema.safeParse(row);
  return parsed.success ? parsed.data : null;
}

function sortNotifications(items: Notification[]): Notification[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function dedupeNotifications(items: Notification[]): Notification[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function useNotifications(
  userId: string,
  initialBootstrap: NotificationBootstrap
) {
  const [notifications, setNotifications] = useState<Notification[]>(
    initialBootstrap.notifications ?? []
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabaseRef = useRef(createClient());
  // Unique per hook instance — header bell + notifications page both use this hook.
  const realtimeChannelIdRef = useRef(
    `notifications:${userId}:${crypto.randomUUID()}`
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = supabaseRef.current;
      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select(
          "id, user_id, type, title, message, action_url, metadata, is_read, created_at"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(NOTIFICATION_LIMIT);

      if (fetchError) throw fetchError;

      const parsed = (data ?? [])
        .map(parseNotificationRow)
        .filter((n): n is Notification => n !== null);

      setNotifications(parsed);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load notifications"
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const markReadLocal = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
  }, []);

  const markAllReadLocal = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  const removeLocal = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const upsertLocal = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      const without = prev.filter((n) => n.id !== notification.id);
      return sortNotifications(dedupeNotifications([notification, ...without])).slice(
        0,
        NOTIFICATION_LIMIT
      );
    });
  }, []);

  useEffect(() => {
    const initialCount = initialBootstrap.notifications?.length ?? 0;
    if (initialCount === 0) {
      void refresh();
    }
  }, [initialBootstrap.notifications?.length, refresh]);

  useEffect(() => {
    const supabase = supabaseRef.current;
    const channelName = realtimeChannelIdRef.current;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = parseNotificationRow(payload.new);
          if (notification) upsertLocal(notification);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = parseNotificationRow(payload.new);
          if (notification) upsertLocal(notification);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const id = (payload.old as { id?: string })?.id;
          if (id) removeLocal(id);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, upsertLocal, removeLocal]);

  return {
    notifications,
    unreadCount,
    error,
    isLoading,
    refresh,
    markReadLocal,
    markAllReadLocal,
    removeLocal,
  };
}
