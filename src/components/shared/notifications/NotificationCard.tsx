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
  leftBorder: string;
  leftBorderRead: string;
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
        leftBorder: "border-l-emerald-500",
        leftBorderRead: "border-l-emerald-300/60",
        icon: UserCheck,
      };
    case "new_message":
      return {
        badgeBg: "bg-indigo-50 text-indigo-800",
        badgeBorder: "border-indigo-200/80",
        badgeText: "text-indigo-800 font-bold",
        leftBorder: "border-l-indigo-500",
        leftBorderRead: "border-l-indigo-300/60",
        icon: MessageSquare,
      };
    case "job_invite":
      return {
        badgeBg: "bg-blue-50 text-blue-800",
        badgeBorder: "border-blue-200/80",
        badgeText: "text-blue-800 font-bold",
        leftBorder: "border-l-blue-500",
        leftBorderRead: "border-l-blue-300/60",
        icon: Mail,
      };
    case "billing_update":
    case "subscription_update":
      return {
        badgeBg: "bg-amber-50 text-amber-800",
        badgeBorder: "border-amber-200/80",
        badgeText: "text-amber-800 font-bold",
        leftBorder: "border-l-amber-500",
        leftBorderRead: "border-l-amber-300/60",
        icon: CreditCard,
      };
    case "verification_update":
    case "identity_verification_request":
      return {
        badgeBg: "bg-teal-50 text-teal-800",
        badgeBorder: "border-teal-200/80",
        badgeText: "text-teal-800 font-bold",
        leftBorder: "border-l-teal-500",
        leftBorderRead: "border-l-teal-300/60",
        icon: ShieldCheck,
      };
    case "job_moderation":
    case "moderation_queue":
    case "flagged_report":
      return {
        badgeBg: "bg-rose-50 text-rose-800",
        badgeBorder: "border-rose-200/80",
        badgeText: "text-rose-800 font-bold",
        leftBorder: "border-l-rose-500",
        leftBorderRead: "border-l-rose-300/60",
        icon: AlertTriangle,
      };
    case "system_alert":
    case "system":
    default:
      return {
        badgeBg: "bg-slate-100 text-slate-700",
        badgeBorder: "border-slate-200",
        badgeText: "text-slate-700 font-bold",
        leftBorder: "border-l-slate-400",
        leftBorderRead: "border-l-slate-300",
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
      {/* Top Header Row: Category Badge, Unread Dot & Timestamp */}
      <div className="flex items-center justify-between gap-2 min-w-0 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
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

        <time className="text-xs text-slate-400 font-medium shrink-0 ml-auto">
          {formattedTime}
        </time>
      </div>

      {/* Main Content: Title & Message */}
      <div className="mt-1 min-w-0">
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
      className={`group relative overflow-hidden rounded-2xl border border-l-4 p-4 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer ${
        isUnread
          ? `border-slate-200/90 ${typeStyle.leftBorder} bg-[#fafdfb] hover:bg-emerald-50/30 hover:border-slate-300`
          : `border-slate-200/80 ${typeStyle.leftBorderRead} bg-white hover:bg-slate-50/80 hover:border-slate-300`
      }`}
    >
      <div className="flex items-start justify-between gap-3">
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
            <button
              type="button"
              onClick={() => {
                if (isUnread && onMarkRead) {
                  onMarkRead(notification.id);
                }
              }}
              className="block w-full text-left min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/40 rounded-xl"
            >
              {cardContent}
            </button>
          )}
        </div>

        {/* Action button slot or standard mark read button */}
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
            className="shrink-0 text-xs font-bold text-[#006e2f] hover:text-[#005c26] hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/40"
          >
            Mark read
          </button>
        ) : null}
      </div>
    </article>
  );
}
