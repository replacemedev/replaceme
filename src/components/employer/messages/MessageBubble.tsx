"use client";

import React from "react";
import { Message } from "@/types/employer/messages";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const senderInitials = (message.senderName || "Candidate")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Safely format message creation timestamp
  let formattedTime = "";
  try {
    const date = new Date(message.createdAt);
    formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    formattedTime = message.createdAt;
  }

  return (
    <div
      className={`flex items-end gap-2.5 max-w-[85%] sm:max-w-[70%] ${
        isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto"
      } animate-fadeIn`}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-100">
        {senderInitials}
      </div>

      {/* Bubble & Timestamp */}
      <div className="flex flex-col gap-1">
        {/* Text Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
            isCurrentUser
              ? "bg-[#006e2f] text-white rounded-br-none"
              : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
          }`}
        >
          {message.content}
        </div>

        {/* Timestamp & Read Receipt Checkmarks */}
        <div
          className={`flex items-center gap-1.5 text-[9px] font-semibold text-slate-400 ${
            isCurrentUser ? "justify-end" : "justify-start"
          }`}
        >
          <span>{formattedTime}</span>
          {isCurrentUser && (
            <span>
              {message.status === "read" || message.readReceipt ? (
                <CheckCheck size={12} className="text-emerald-500" />
              ) : (
                <Check size={12} className="text-slate-300" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
