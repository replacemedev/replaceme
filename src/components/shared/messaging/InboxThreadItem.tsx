"use client";

import Image from "next/image";
import { MessagingThread } from "@/types/messaging";

interface InboxThreadItemProps {
  thread: MessagingThread;
  isActive: boolean;
  onClick: () => void;
}

function formatTime(isoString?: string) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  const diffDays = Math.ceil(
    Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays < 7) {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function InboxThreadItem({ thread, isActive, onClick }: InboxThreadItemProps) {
  const { oppositeParty } = thread;
  const isUnread = thread.unread_count > 0;
  const snippet = thread.last_message?.content || "No messages yet";
  const time = formatTime(
    thread.last_message?.created_at || thread.updated_at
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left flex items-start gap-3 p-4 border-b border-slate-100 hover:bg-slate-50/80 transition-all cursor-pointer ${
        isActive
          ? "bg-[#f4faf6]/60 border-l-[3px] border-l-[#006e2f] pl-[13px]"
          : "pl-4"
      }`}
    >
      <div className="relative shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[#e8f5e9] text-[#006e2f] font-semibold text-sm">
        {oppositeParty.avatarUrl ? (
          <Image
            src={oppositeParty.avatarUrl}
            alt={oppositeParty.name}
            fill
            className="rounded-full object-cover"
            sizes="40px"
          />
        ) : (
          <span>{initials(oppositeParty.name)}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h4 className="font-semibold text-slate-800 text-sm truncate">
            {oppositeParty.name}
          </h4>
          <span
            className={`text-[11px] font-medium shrink-0 ml-2 ${
              isUnread ? "text-[#006e2f]" : "text-slate-400"
            }`}
          >
            {time}
          </span>
        </div>

        <p
          className={`text-[13px] leading-normal line-clamp-2 pr-4 mb-2 ${
            isUnread ? "text-slate-900 font-medium" : "text-slate-500"
          }`}
        >
          {snippet}
        </p>

        <div className="flex items-center justify-between gap-2">
          {thread.jobTitle ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600">
              {thread.jobTitle}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </span>
          ) : (
            <span />
          )}
          {isUnread && (
            <span className="w-2 h-2 rounded-full bg-[#006e2f] shrink-0" />
          )}
        </div>
      </div>
    </button>
  );
}
