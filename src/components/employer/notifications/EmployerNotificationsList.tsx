"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/actions/notifications";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  getNotificationHref,
  NOTIFICATION_TYPE_LABELS,
  type Notification,
} from "@/types/notifications.types";
import { EmployerPageHeader } from "@/components/employer/layout/EmployerPageHeader";
import { EMPLOYER_CARD } from "@/lib/employer/ui-tokens";

interface EmployerNotificationsListProps {
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

export function EmployerNotificationsList({
  notifications,
  unreadCount,
}: EmployerNotificationsListProps) {
  const [pending, startTransition] = useTransition();
  const grouped = groupByDate(notifications);

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (result.success) {
        toast.success("All notifications marked as read");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <EmployerPageHeader
        title="Notifications"
        subhead="Applicant updates, messages, and hiring activity."
        actions={
          unreadCount > 0 ? (
            <button
              type="button"
              disabled={pending}
              onClick={handleMarkAllRead}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <CheckCheck className="h-4 w-4" aria-hidden />
              )}
              Mark all read
            </button>
          ) : null
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={22} />}
          title="No notifications"
          description="You're all caught up. New alerts will appear here."
        />
      ) : (
        <div className="space-y-8">
          {unreadCount > 0 ? (
            <p className="text-xs font-bold text-[#006e2f]">
              {unreadCount} unread
            </p>
          ) : null}

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
                    <NotificationRow
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NotificationRow({ notification }: { notification: Notification }) {
  const href = getNotificationHref(notification);
  const typeLabel =
    NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type;

  const handleMarkRead = () => {
    void markNotificationRead(notification.id);
  };

  const card = (
    <article
      className={`${EMPLOYER_CARD} px-4 py-3 transition-colors ${
        notification.is_read
          ? "border-slate-200"
          : "border-[#006e2f]/25 bg-[#fafdfb]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {typeLabel}
          </p>
          <p
            className={`text-sm font-bold mt-0.5 ${
              notification.is_read ? "text-slate-700" : "text-slate-900"
            }`}
          >
            {notification.title}
          </p>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            {notification.message}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            {new Date(notification.created_at).toLocaleString()}
          </p>
        </div>
        {!notification.is_read ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMarkRead();
            }}
            className="shrink-0 text-[11px] font-bold text-[#006e2f] hover:underline"
          >
            Mark read
          </button>
        ) : null}
      </div>
    </article>
  );

  if (href) {
    return (
      <li>
        <Link
          href={href}
          onClick={() => {
            if (!notification.is_read) handleMarkRead();
          }}
          className="block"
        >
          {card}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={handleMarkRead}
        className="block w-full text-left"
      >
        {card}
      </button>
    </li>
  );
}
