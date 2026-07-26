"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  isNotificationArchived,
  notificationSchema,
  type Notification,
  type NotificationBootstrap,
} from "@/types/notifications.types";

const NOTIFICATION_LIMIT = 50;

const NOTIFICATION_COLUMNS =
  "id, user_id, type, title, message, action_url, metadata, is_read, archived_at, created_at";

export type NotificationScope = "active" | "archived";

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

function matchesScope(
  notification: Notification,
  scope: NotificationScope
): boolean {
  const archived = isNotificationArchived(notification);
  return scope === "archived" ? archived : !archived;
}

export function useNotifications(
  userId: string,
  initialBootstrap: NotificationBootstrap,
  scope: NotificationScope = "active"
) {
  const [notifications, setNotifications] = useState<Notification[]>(
    () =>
      (initialBootstrap.notifications ?? []).filter((n) =>
        matchesScope(n, scope)
      )
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabaseRef = useRef(createClient());
  const scopeRef = useRef(scope);
  scopeRef.current = scope;
  // Unique per hook instance — header bell + notifications page both use this hook.
  const realtimeChannelIdRef = useRef(
    `notifications:${userId}:${crypto.randomUUID()}`
  );

  const unreadCount = useMemo(
    () =>
      notifications.filter((n) => !n.is_read && !isNotificationArchived(n))
        .length,
    [notifications]
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = supabaseRef.current;
      let query = supabase
        .from("notifications")
        .select(NOTIFICATION_COLUMNS)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(NOTIFICATION_LIMIT);

      query =
        scopeRef.current === "archived"
          ? query.not("archived_at", "is", null)
          : query.is("archived_at", null);

      const { data, error: fetchError } = await query;

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

  const markUnreadLocal = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, is_read: false } : n
      )
    );
  }, []);

  const markAllReadLocal = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) =>
        isNotificationArchived(n) ? n : { ...n, is_read: true }
      )
    );
  }, []);

  const archiveLocal = useCallback((notificationId: string) => {
    setNotifications((prev) => {
      if (scopeRef.current === "archived") {
        return prev.map((n) =>
          n.id === notificationId
            ? { ...n, archived_at: new Date().toISOString(), is_read: true }
            : n
        );
      }
      return prev.filter((n) => n.id !== notificationId);
    });
  }, []);

  const unarchiveLocal = useCallback((notificationId: string) => {
    setNotifications((prev) => {
      if (scopeRef.current === "archived") {
        return prev.filter((n) => n.id !== notificationId);
      }
      return prev;
    });
  }, []);

  const removeLocal = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const upsertLocal = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      if (!matchesScope(notification, scopeRef.current)) {
        return prev.filter((n) => n.id !== notification.id);
      }
      const without = prev.filter((n) => n.id !== notification.id);
      return sortNotifications(
        dedupeNotifications([notification, ...without])
      ).slice(0, NOTIFICATION_LIMIT);
    });
  }, []);

  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      const hasBootstrap =
        scope === "active" && (initialBootstrap.notifications?.length ?? 0) > 0;
      if (!hasBootstrap) void refresh();
      return;
    }
    void refresh();
  }, [refresh, scope, initialBootstrap.notifications?.length]);

  useEffect(() => {
    const supabase = supabaseRef.current;
    const channelName = realtimeChannelIdRef.current;
    let cancelled = false;

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
      );

    void (async () => {
      // Keep Realtime JWT in sync for RLS-scoped postgres_changes (Supabase docs).
      await supabase.realtime.setAuth();
      if (cancelled) return;
      channel.subscribe();
    })();

    return () => {
      cancelled = true;
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
    markUnreadLocal,
    markAllReadLocal,
    archiveLocal,
    unarchiveLocal,
    removeLocal,
  };
}
