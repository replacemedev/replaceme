"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { markAllNotificationsRead, markNotificationRead } from "@/actions/notifications";
import { useNotifications } from "@/hooks/useNotifications";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  getNotificationHref,
  NOTIFICATION_TYPE_LABELS,
  type Notification,
  type NotificationBootstrap,
} from "@/types/notifications.types";

interface AdminNotificationsClientProps {
  userId: string;
  initialBootstrap: NotificationBootstrap;
}

export function AdminNotificationsClient({
  userId,
  initialBootstrap,
}: AdminNotificationsClientProps) {
  const [pending, startTransition] = useTransition();
  const { notifications, unreadCount, markReadLocal, markAllReadLocal } =
    useNotifications(userId, initialBootstrap);

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (result.success) {
        markAllReadLocal();
        toast.success("All notifications marked as read");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleMarkRead = (notificationId: string) => {
    markReadLocal(notificationId);
    void markNotificationRead(notificationId);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notifications"
        description="Platform alerts for moderation, identity review, billing, and system events."
      >
        {unreadCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={handleMarkAllRead}
            className="shrink-0"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <CheckCheck className="h-4 w-4" aria-hidden />
            )}
            Mark all read
          </Button>
        ) : null}
      </AdminPageHeader>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-5 w-5" aria-hidden />}
          title="No notifications"
          description="You're all caught up. New platform alerts will appear here."
        />
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <AdminSectionLabel>Inbox</AdminSectionLabel>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-[#ebfdf2] px-2.5 py-1 text-[11px] font-bold text-[#006e2f]">
                {unreadCount} unread
              </span>
            ) : null}
          </div>
          <ul className="space-y-3">
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onMarkRead={() => handleMarkRead(notification.id)}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: () => void;
}) {
  const href = getNotificationHref(notification);
  const typeLabel =
    NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type;

  const card = (
    <article
      className={`rounded-2xl border px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-colors ${
        notification.is_read
          ? "border-slate-200/80 bg-white"
          : "border-[#006e2f]/25 bg-[#ebfdf2]/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-sm font-semibold ${
            notification.is_read ? "text-slate-700" : "text-slate-900"
          }`}
        >
          {notification.title}
        </p>
        {!notification.is_read ? (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
        ) : null}
      </div>
      <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {typeLabel}
        </span>
        <time className="text-xs text-slate-400">
          {new Date(notification.created_at).toLocaleString()}
        </time>
      </div>
    </article>
  );

  if (href) {
    return (
      <li>
        <Link
          href={href}
          onClick={onMarkRead}
          className="block rounded-2xl hover:opacity-95"
        >
          {card}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button type="button" onClick={onMarkRead} className="block w-full text-left">
        {card}
      </button>
    </li>
  );
}
