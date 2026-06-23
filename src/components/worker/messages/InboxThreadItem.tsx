"use client";

import React from "react";
import Image from "next/image";
import { ChatThread } from "@/types/messaging";

interface InboxThreadItemProps {
  thread: ChatThread;
  isActive: boolean;
  onClick: () => void;
}

export function InboxThreadItem({ thread, isActive, onClick }: InboxThreadItemProps) {
  const companyName = thread.company_profiles?.company_name || "Employer";
  const logoUrl = thread.company_profiles?.logo_url;

  // Get company initials
  const initials = companyName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Format time/date
  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    
    // Check if today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }
    
    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    
    // Check if within a week
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days[date.getDay()];
    }
    
    // Fallback date
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const formattedTime = formatTime(thread.last_message?.created_at || thread.updated_at);
  const snippet = thread.last_message?.content || "No messages yet";
  const isUnread = (thread.unread_count || 0) > 0;
  const jobTitle = thread.jobs?.title;

  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left flex items-start gap-3 p-4 border-b border-slate-100 hover:bg-slate-50/80 transition-all duration-200 cursor-pointer ${
        isActive ? "bg-[#f4faf6]/60 border-l-[3px] border-l-[#006e2f] pl-[13px]" : "pl-4"
      }`}
    >
      {/* Avatar Container */}
      <div className="relative shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[#e8f5e9] text-[#006e2f] font-semibold text-sm">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={companyName}
            fill
            className="rounded-full object-cover"
            sizes="40px"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h4 className="font-semibold text-slate-800 text-sm truncate leading-snug">
            {companyName}
          </h4>
          <span className={`text-[11px] font-medium shrink-0 ml-2 ${
            isUnread ? "text-[#006e2f]" : "text-slate-400"
          }`}>
            {formattedTime}
          </span>
        </div>

        <p className={`text-[13px] leading-normal line-clamp-2 pr-4 mb-2 ${
          isUnread ? "text-slate-900 font-medium" : "text-slate-500"
        }`}>
          {snippet}
        </p>

        {/* Dynamic Job Tag and Indicators */}
        <div className="flex items-center justify-between gap-2">
          {jobTitle ? (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600">
              <span>{jobTitle}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          ) : (
            <div />
          )}

          {isUnread && (
            <span className="w-2 h-2 rounded-full bg-[#006e2f] shrink-0" />
          )}
        </div>
      </div>
    </button>
  );
}
