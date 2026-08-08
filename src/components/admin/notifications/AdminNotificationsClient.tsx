"use client";

import Link from "next/link";
import {
  Suspense,
  useMemo,
  useTransition,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  Bell,
  Check,
  CheckCheck,
  Loader2,
  Mail,
  MailOpen,
} from "lucide-react";
import { toast } from "sonner";
import {
  archiveNotification,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
  unarchiveNotification,
} from "@/actions/notifications";
import { useNotifications } from "@/hooks/useNotifications";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { AdminTabs } from "@/components/admin/shared/AdminTabs";
import { NotificationCardSkeleton } from "@/components/shared/notifications/NotificationCardSkeleton";
import { AdminNotificationsPageSkeleton } from "@/components/admin/shared/AdminSkeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import {
  ADMIN_NOTIFICATION_TABS,
  getNotificationCategory,
  getNotificationHref,
  isNotificationArchived,
  NOTIFICATION_TYPE_LABELS,
  type AdminNotificationTabId,
  type Notification,
  type NotificationBootstrap,
} from "@/types/notifications.types";

interface AdminNotificationsClientProps {
  userId: string;
  initialBootstrap: NotificationBootstrap;
}

type DateBucket = "Today" | "Yesterday" | "Earlier";

function resolveTab(raw: string | null): AdminNotificationTabId {
  const match = ADMIN_NOTIFICATION_TABS.find((tab) => tab.id === raw);
  return match?.id ?? "all";
}

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
    date.setHours(0, 0, 0, 0);
    if (date.getTime() >= today.getTime()) {
      groups.Today.push(notification);
    } else if (date.getTime() >= yesterday.getTime()) {
      groups.Yesterday.push(notification);
    } else {
      groups.Earlier.push(notification);
    }
  }

  return (Object.keys(groups) as DateBucket[]).filter(
    (bucket) => groups[bucket].length > 0
  ).map((bucket) => ({ bucket, items: groups[bucket] }));
}

function emptyCopy(tab: AdminNotificationTabId): {
  title: string;
  description: string;
} {
  switch (tab) {
    case "unread":
      return {
        title: "No unread alerts",
        description: "You're caught up. New platform alerts will land here.",
      };
    case "archived":
      return {
        title: "No archived alerts",
        description:
          "Dismissed alerts stay here for audit review. Nothing is permanently deleted.",
      };
    case "identity":
      return {
        title: "No identity alerts",
        description: "Pending verification requests will appear in this filter.",
      };
    case "moderation":
      return {
        title: "No moderation alerts",
        description: "Job and safety queue items will show up here.",
      };
    case "billing":
      return {
        title: "No billing alerts",
        description: "Subscription and billing events will appear here.",
      };
    case "system":
      return {
        title: "No system alerts",
        description: "Platform and system notices will appear here.",
      };
    default:
      return {
        title: "No notifications",
        description: "You're all caught up. New platform alerts will appear here.",
      };
  }
}

export function AdminNotificationsClient({
  userId,
  initialBootstrap,
}: AdminNotificationsClientProps) {
  return (
    <Suspense fallback={<AdminNotificationsPageSkeleton />}>
      <AdminNotificationsInbox
        userId={userId}
        initialBootstrap={initialBootstrap}
      />
    </Suspense>
  );
}

function AdminNotificationsInbox({
  userId,
  initialBootstrap,
}: AdminNotificationsClientProps) {
  const searchParams = useSearchParams();
  const tab = resolveTab(searchParams.get("tab"));
  const scope = tab === "archived" ? "archived" : "active";
  const [pending, startTransition] = useTransition();

  const {
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
  } = useNotifications(userId, initialBootstrap, scope);

  const filtered = useMemo(() => {
    if (tab === "all" || tab === "archived") return notifications;
    if (tab === "unread") {
      return notifications.filter((n) => !n.is_read);
    }
    return notifications.filter((n) => getNotificationCategory(n.type) === tab);
  }, [notifications, tab]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const tabsWithCounts = useMemo(
    () =>
      ADMIN_NOTIFICATION_TABS.map((item) => {
        if (item.id === "unread") {
          return { ...item, count: unreadCount > 0 ? unreadCount : undefined };
        }
        return { id: item.id, label: item.label };
      }),
    [unreadCount]
  );

  const handleMarkAllRead = () => {
    markAllReadLocal();
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (result.success) {
        toast.success("All notifications marked as read");
      } else {
        toast.error(result.error);
        void refresh();
      }
    });
  };

  const handleMarkRead = (notificationId: string) => {
    markReadLocal(notificationId);
    void markNotificationRead(notificationId).then((result) => {
      if (!result.success) {
        toast.error(result.error);
        void refresh();
      }
    });
  };

  const handleMarkUnread = (notificationId: string) => {
    markUnreadLocal(notificationId);
    void markNotificationUnread(notificationId).then((result) => {
      if (!result.success) {
        toast.error(result.error);
        void refresh();
      }
    });
  };

  const handleArchive = (notificationId: string) => {
    archiveLocal(notificationId);
    void archiveNotification(notificationId).then((result) => {
      if (result.success) {
        toast.success("Notification archived");
      } else {
        toast.error(result.error);
        void refresh();
      }
    });
  };

  const handleUnarchive = (notificationId: string) => {
    unarchiveLocal(notificationId);
    void unarchiveNotification(notificationId).then((result) => {
      if (result.success) {
        toast.success("Notification restored to inbox");
      } else {
        toast.error(result.error);
        void refresh();
      }
    });
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading notifications">
        <AdminPageHeader
          title="Notifications"
          description="Triage Identity, Moderation, Billing, and System alerts. Archiving hides alerts from your inbox but keeps them for audit retention."
        />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <NotificationCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Notifications"
          description="Platform alerts for moderation, identity review, billing, and system events."
        />
        <ErrorState
          title="Unable to load notifications"
          description={error}
          retryHref="/admin/notifications"
        />
      </div>
    );
  }

  const empty = emptyCopy(tab);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notifications"
        description="Triage Identity, Moderation, Billing, and System alerts. Archiving hides alerts from your inbox but keeps them for audit retention."
      >
        {unreadCount > 0 && tab !== "archived" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={handleMarkAllRead}
            className="min-h-11 shrink-0 touch-manipulation px-4 sm:min-h-9"
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

      <div className="sticky top-0 z-20 -mx-1 border-b border-slate-200/80 bg-[#f8fafc]/95 px-1 backdrop-blur-md supports-[backdrop-filter]:bg-[#f8fafc]/80">
        <AdminTabs tabs={[...tabsWithCounts]} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-5 w-5" aria-hidden />}
          title={empty.title}
          description={empty.description}
        />
      ) : (
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <AdminSectionLabel>
              {tab === "archived" ? "Archive" : "Inbox"}
            </AdminSectionLabel>
            {unreadCount > 0 && tab !== "archived" ? (
              <span className="rounded-full bg-[#ebfdf2] px-2.5 py-1 text-[11px] font-bold text-[#006e2f]">
                {unreadCount} unread
              </span>
            ) : null}
          </div>

          {grouped.map(({ bucket, items }) => (
            <div key={bucket} className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {bucket}
              </p>
              <ul className="space-y-3">
                {items.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onOpen={() => {
                      if (
                        !notification.is_read &&
                        !isNotificationArchived(notification)
                      ) {
                        handleMarkRead(notification.id);
                      }
                    }}
                    onMarkRead={() => handleMarkRead(notification.id)}
                    onMarkUnread={() => handleMarkUnread(notification.id)}
                    onArchive={() => handleArchive(notification.id)}
                    onUnarchive={() => handleUnarchive(notification.id)}
                  />
                ))}
              </ul>
            </div>
          ))}

          {isLoading ? (
            <p className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Refreshing…
            </p>
          ) : null}
        </section>
      )}
    </div>
  );
}

function NotificationRow({
  notification,
  onOpen,
  onMarkRead,
  onMarkUnread,
  onArchive,
  onUnarchive,
}: {
  notification: Notification;
  onOpen: () => void;
  onMarkRead: () => void;
  onMarkUnread: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
}) {
  const href = getNotificationHref(notification);
  const typeLabel =
    NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type;
  const archived = isNotificationArchived(notification);
  const unread = !notification.is_read && !archived;

  const actions = (
    <div className="relative z-10 flex shrink-0 items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
      {archived ? (
        <ActionIconButton
          label="Restore to inbox"
          onClick={onUnarchive}
          icon={<ArchiveRestore className="h-4 w-4" aria-hidden />}
        />
      ) : (
        <>
          {unread ? (
            <ActionIconButton
              label="Mark as read"
              onClick={onMarkRead}
              icon={<Check className="h-4 w-4" aria-hidden />}
            />
          ) : (
            <ActionIconButton
              label="Mark as unread"
              onClick={onMarkUnread}
              icon={<Mail className="h-4 w-4" aria-hidden />}
            />
          )}
          <ActionIconButton
            label="Archive notification"
            onClick={onArchive}
            icon={<Archive className="h-4 w-4" aria-hidden />}
          />
        </>
      )}
    </div>
  );

  const body = (
    <>
      <div className="flex min-w-0 items-start gap-2">
        {unread ? (
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#006e2f]"
            aria-hidden
          />
        ) : (
          <MailOpen
            className="mt-0.5 h-4 w-4 shrink-0 text-slate-300"
            aria-hidden
          />
        )}
        <p
          className={`min-w-0 flex-1 truncate text-sm ${
            unread
              ? "font-semibold text-slate-900"
              : "font-medium text-slate-700"
          }`}
        >
          {notification.title}
        </p>
      </div>
      <p className="mt-1 line-clamp-2 min-w-0 break-words pl-6 text-sm text-slate-600">
        {notification.message}
      </p>
      <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-2 pl-6">
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {typeLabel}
        </span>
        <time className="shrink-0 text-xs text-slate-400">
          {new Date(notification.created_at).toLocaleString()}
        </time>
      </div>
    </>
  );

  return (
    <li>
      <article
        className={`group relative overflow-visible rounded-2xl border px-4 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-colors ${
          unread
            ? "border-[#006e2f]/25 bg-[#ebfdf2]/40"
            : "border-slate-200/80 bg-white"
        }`}
      >
        <div className="flex min-w-0 items-start gap-2">
          <div className="min-w-0 flex-1">
            {href ? (
              <Link
                href={href}
                onClick={onOpen}
                className="block min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/40"
              >
                {body}
              </Link>
            ) : (
              <button
                type="button"
                onClick={onOpen}
                className="block w-full min-w-0 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/40"
              >
                {body}
              </button>
            )}
          </div>
          {actions}
        </div>
      </article>
    </li>
  );
}

function ActionIconButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-11 w-11 touch-manipulation items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/40 sm:h-9 sm:w-9"
    >
      {icon}
    </button>
  );
}
