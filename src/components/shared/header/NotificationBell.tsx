"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Loader2,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/actions/notifications";
import {
  getNotificationHref,
  NOTIFICATION_TYPE_LABELS,
  type Notification,
  type NotificationBootstrap,
} from "@/types/notifications.types";

interface NotificationBellProps {
  userId: string;
  initialBootstrap: NotificationBootstrap;
  size?: number;
  className?: string;
}

export function NotificationBell({
  userId,
  initialBootstrap,
  size = 20,
  className = "",
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    error,
    isLoading,
    refresh,
    markReadLocal,
    markAllReadLocal,
  } = useNotifications(userId, initialBootstrap);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  const handleMarkAllRead = () => {
    markAllReadLocal();
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (!result.success) {
        toast.error(result.error);
        void refresh();
      }
    });
  };

  const handleMarkRead = (notification: Notification) => {
    if (notification.is_read) return;
    markReadLocal(notification.id);
    startTransition(async () => {
      const result = await markNotificationRead(notification.id);
      if (!result.success) {
        toast.error(result.error);
        void refresh();
      }
    });
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative p-2 text-slate-500 hover:text-[#006e2f] hover:bg-slate-50 rounded-xl transition-all duration-200 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-[#006e2f]"
        aria-label={
          unreadCount > 0
            ? `View notifications (${unreadCount} unread)`
            : "View notifications"
        }
        aria-expanded={open}
        aria-controls={panelId}
      >
        <Bell size={size} aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-[calc(100%+8px)] z-[60] w-[min(100vw-2rem,380px)] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
        >
          <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-slate-900">Notifications</p>
              <p className="text-[11px] text-slate-400">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={pending}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" aria-hidden />
                Mark all read
              </button>
            ) : null}
          </header>

          <div className="max-h-[min(60vh,420px)] overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <NotificationSkeletonList />
            ) : error ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <AlertCircle className="h-8 w-8 text-red-400" aria-hidden />
                <p className="text-sm font-semibold text-slate-800">
                  Could not load notifications
                </p>
                <p className="text-xs text-slate-500">{error}</p>
                <button
                  type="button"
                  onClick={() => void refresh()}
                  className="mt-2 text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Inbox className="h-5 w-5" aria-hidden />
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  You&apos;re all caught up!
                </p>
                <p className="text-xs text-slate-500">
                  New alerts for your role will appear here instantly.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={() => handleMarkRead(notification)}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </ul>
            )}
          </div>

          {isLoading && notifications.length > 0 ? (
            <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Refreshing…
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkRead,
  onNavigate,
}: {
  notification: Notification;
  onMarkRead: () => void;
  onNavigate: () => void;
}) {
  const href = getNotificationHref(notification);
  const typeLabel =
    NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type;

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p
          className={`text-sm font-semibold ${
            notification.is_read ? "text-slate-600" : "text-slate-900"
          }`}
        >
          {notification.title}
        </p>
        {!notification.is_read ? (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
        ) : null}
      </div>
      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
        {notification.message}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {typeLabel}
        </span>
        <time className="text-[10px] text-slate-400">
          {formatRelativeTime(notification.created_at)}
        </time>
      </div>
    </>
  );

  if (href) {
    return (
      <li>
        <Link
          href={href}
          onClick={() => {
            onMarkRead();
            onNavigate();
          }}
          className={`block px-4 py-3 transition-colors hover:bg-slate-50 ${
            notification.is_read ? "opacity-80" : "bg-emerald-50/30"
          }`}
        >
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={onMarkRead}
        className={`block w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
          notification.is_read ? "opacity-80" : "bg-emerald-50/30"
        }`}
      >
        {content}
      </button>
    </li>
  );
}

function NotificationSkeletonList() {
  return (
    <ul className="divide-y divide-slate-50 p-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <li key={index} className="px-2 py-3">
          <div className="h-3 w-2/5 animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-2.5 w-full animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-2.5 w-4/5 animate-pulse rounded bg-slate-100" />
        </li>
      ))}
    </ul>
  );
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
