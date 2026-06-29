"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/actions/notifications";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  getNotificationHref,
  type Notification,
} from "@/types/notifications.types";
import { WORKER_CARD } from "@/lib/worker/ui-tokens";

interface WorkerNotificationsClientProps {
  notifications: Notification[];
  unreadCount: number;
}

export function WorkerNotificationsClient({
  notifications: initialNotifications,
  unreadCount: initialUnread,
}: WorkerNotificationsClientProps) {
  const [pending, startTransition] = useTransition();

  function handleMarkAll() {
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("All notifications marked as read");
    });
  }

  function handleMarkOne(id: string) {
    void markNotificationRead(id);
  }

  if (initialNotifications.length === 0) {
    return (
      <EmptyState
        icon={<Bell size={22} aria-hidden />}
        title="No notifications"
        description="You're all caught up. New alerts will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {initialUnread > 0 ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006e2f] hover:underline disabled:opacity-60"
          >
            <CheckCheck className="h-4 w-4" aria-hidden />
            Mark all read
          </button>
        </div>
      ) : null}

      <ul className="space-y-3">
        {initialNotifications.map((notification) => {
          const href = getNotificationHref(notification);
          const content = (
            <>
              <p className="text-sm font-bold text-slate-900">
                {notification.title}
              </p>
              <p className="text-sm text-slate-600 mt-0.5">
                {notification.message}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(notification.created_at).toLocaleString()}
              </p>
            </>
          );

          return (
            <li
              key={notification.id}
              className={`${WORKER_CARD} px-4 py-3 ${
                notification.is_read ? "" : "border-[#006e2f]/30 bg-[#ebfdf2]/30"
              }`}
            >
              {href ? (
                <Link
                  href={href}
                  onClick={() => handleMarkOne(notification.id)}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 rounded-lg"
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => handleMarkOne(notification.id)}
                  className="w-full text-left"
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
