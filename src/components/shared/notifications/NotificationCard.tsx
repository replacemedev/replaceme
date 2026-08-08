"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import {
  Bell,
  CreditCard,
  Mail,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import {
  NOTIFICATION_TYPE_LABELS,
  getNotificationHref,
  type Notification,
} from "@/types/notifications.types";

interface NotificationCardProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  actions?: ReactNode;
}

type TypeStyle = {
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  icon: React.ComponentType<{ className?: string }>;
};

function getTypeStyle(type: string): TypeStyle {
  switch (type) {
    case "new_applicant":
    case "application_status":
    case "worker_acceptance":
      return {
        badgeBg: "bg-emerald-50 text-emerald-800",
        badgeBorder: "border-emerald-200/80",
        badgeText: "text-emerald-800 font-bold",
        icon: UserCheck,
      };
    case "new_message":
      return {
        badgeBg: "bg-indigo-50 text-indigo-800",
        badgeBorder: "border-indigo-200/80",
        badgeText: "text-indigo-800 font-bold",
        icon: MessageSquare,
      };
    case "job_invite":
      return {
        badgeBg: "bg-blue-50 text-blue-800",
        badgeBorder: "border-blue-200/80",
        badgeText: "text-blue-800 font-bold",
        icon: Mail,
      };
    case "billing_update":
    case "subscription_update":
      return {
        badgeBg: "bg-amber-50 text-amber-800",
        badgeBorder: "border-amber-200/80",
        badgeText: "text-amber-800 font-bold",
        icon: CreditCard,
      };
    case "verification_update":
    case "identity_verification_request":
      return {
        badgeBg: "bg-teal-50 text-teal-800",
        badgeBorder: "border-teal-200/80",
        badgeText: "text-teal-800 font-bold",
        icon: ShieldCheck,
      };
    case "job_moderation":
    case "moderation_queue":
    case "flagged_report":
      return {
        badgeBg: "bg-rose-50 text-rose-800",
        badgeBorder: "border-rose-200/80",
        badgeText: "text-rose-800 font-bold",
        icon: AlertTriangle,
      };
    case "system_alert":
    case "system":
    default:
      return {
        badgeBg: "bg-slate-100 text-slate-700",
        badgeBorder: "border-slate-200",
        badgeText: "text-slate-700 font-bold",
        icon: Bell,
      };
  }
}

function formatNotificationTime(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function NotificationCard({
  notification,
  onMarkRead,
  actions,
}: NotificationCardProps) {
  const href = getNotificationHref(notification);
  const typeLabel =
    NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type;
  const typeStyle = useMemo(() => getTypeStyle(notification.type), [notification.type]);
  const CategoryIcon = typeStyle.icon;
  const formattedTime = useMemo(
    () => formatNotificationTime(notification.created_at),
    [notification.created_at]
  );

  const isUnread = !notification.is_read;

  const cardContent = (
    <div className="flex flex-col gap-2 min-w-0">
      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase ${typeStyle.badgeBg} ${typeStyle.badgeBorder} ${typeStyle.badgeText}`}
        >
          <CategoryIcon className="h-3 w-3 shrink-0" aria-hidden />
          <span>{typeLabel}</span>
        </span>

        {isUnread ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006e2f] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[#006e2f] animate-pulse" aria-hidden />
            Unread
          </span>
        ) : null}
      </div>

      {/* Main Content: Title & Message */}
      <div className="mt-0.5 min-w-0">
        <h3
          className={`text-sm leading-snug ${
            isUnread
              ? "font-bold text-slate-900"
              : "font-semibold text-slate-800"
          }`}
        >
          {notification.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mt-1 break-words">
          {notification.message}
        </p>
      </div>
    </div>
  );

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
        isUnread
          ? "border-slate-200/90 bg-slate-50/70 hover:bg-slate-100/60 hover:border-slate-300"
          : "border-slate-200/80 bg-white hover:bg-slate-50/80 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          {href ? (
            <Link
              href={href}
              onClick={() => {
                if (isUnread && onMarkRead) {
                  onMarkRead(notification.id);
                }
              }}
              className="block min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/40 rounded-xl"
            >
              {cardContent}
            </Link>
          ) : (
            <div
              onClick={() => {
                if (isUnread && onMarkRead) {
                  onMarkRead(notification.id);
                }
              }}
              className="block w-full text-left min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/40 rounded-xl cursor-pointer"
            >
              {cardContent}
            </div>
          )}
        </div>

        {/* Timestamp & Action button container */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <time className="text-xs text-slate-400 font-medium whitespace-nowrap">
            {formattedTime}
          </time>
          {actions ? (
            <div className="shrink-0">{actions}</div>
          ) : isUnread && onMarkRead ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMarkRead(notification.id);
              }}
              className="text-xs font-semibold text-slate-600 hover:text-[#006e2f] hover:bg-emerald-50/80 px-2.5 py-1 rounded-md border border-slate-200/90 hover:border-emerald-200/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/40 touch-manipulation cursor-pointer"
            >
              Mark as read
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

