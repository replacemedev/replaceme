"use client";

import { useTransition } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/actions/notifications";
import { EmptyState } from "@/components/shared/EmptyState";
import { NotificationCard } from "@/components/shared/notifications/NotificationCard";
import { type Notification } from "@/types/notifications.types";

interface WorkerNotificationsClientProps {
  notifications: Notification[];
  unreadCount: number;
}

type DateBucket = "Today" | "Yesterday" | "Earlier";

function groupByDate(notifications: Notification[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: Record<DateBucket, Notification[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  for (const notification of notifications) {
    const date = new Date(notification.created_at);
    if (Number.isNaN(date.getTime())) {
      groups.Earlier.push(notification);
      continue;
    }
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      groups.Today.push(notification);
    } else if (date.getTime() === yesterday.getTime()) {
      groups.Yesterday.push(notification);
    } else {
      groups.Earlier.push(notification);
    }
  }

  return groups;
}

const BUCKET_ORDER: DateBucket[] = ["Today", "Yesterday", "Earlier"];

export function WorkerNotificationsClient({
  notifications: initialNotifications,
  unreadCount: initialUnread,
}: WorkerNotificationsClientProps) {
  const [pending, startTransition] = useTransition();
  const grouped = groupByDate(initialNotifications);

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
      <div className="max-w-3xl mx-auto w-full">
        <EmptyState
          icon={<Bell size={22} aria-hidden />}
          title="No notifications"
          description="You're all caught up. New alerts will appear here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {initialUnread > 0 ? (
          <p className="text-xs font-bold text-[#006e2f] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#006e2f] animate-pulse" />
            {initialUnread} unread notification{initialUnread === 1 ? "" : "s"}
          </p>
        ) : (
          <div />
        )}

        {initialUnread > 0 ? (
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={pending}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/40"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <CheckCheck className="h-3.5 w-3.5 text-[#006e2f]" aria-hidden />
            )}
            Mark all read
          </button>
        ) : null}
      </div>

      <div className="space-y-8">
        {BUCKET_ORDER.map((bucket) => {
          const items = grouped[bucket];
          if (items.length === 0) return null;

          return (
            <section key={bucket} className="space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                {bucket}
              </h2>
              <ul className="space-y-3">
                {items.map((notification) => (
                  <li key={notification.id}>
                    <NotificationCard
                      notification={notification}
                      onMarkRead={handleMarkOne}
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
