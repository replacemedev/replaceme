"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { AvatarImage } from "@/components/shared/media/AvatarImage";
import { LogoImage } from "@/components/shared/media/LogoImage";
import { RecentMessage } from "@/types/worker";

interface RecentMessageRowProps {
  message: RecentMessage;
}

export function RecentMessageRow({ message }: RecentMessageRowProps) {
  const formattedTime = message.latest_message_time
    ? new Date(message.latest_message_time).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const companyName = message.other_company_name || "Unknown Company";
  const initials = companyName[0].toUpperCase();

  return (
    <Link
      href={`/worker/messages?threadId=${message.thread_id}`}
      className="group flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-200 gap-4"
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="relative w-12 h-12 rounded-full shrink-0 border border-slate-100 bg-slate-50 overflow-hidden">
          {message.other_company_logo ? (
            <LogoImage
              src={message.other_company_logo}
              alt={`${companyName} Logo`}
              label={companyName}
              sizePx={48}
              rounded="full"
            />
          ) : (
            <AvatarImage
              src={message.other_avatar_url}
              alt="Employer Avatar"
              initials={initials}
              size="sm"
            />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#006e2f] transition-colors">
              {companyName}
            </h4>
            <span className="text-[10px] font-semibold text-slate-400 shrink-0">
              {formattedTime}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium truncate max-w-lg leading-relaxed">
            {message.latest_message || "No messages yet in this conversation."}
          </p>
        </div>
      </div>

      <div className="p-2 bg-slate-50 group-hover:bg-[#ebfdf2] rounded-xl text-slate-400 group-hover:text-[#006e2f] transition-colors duration-200">
        <MessageSquare size={16} />
      </div>
    </Link>
  );
}
