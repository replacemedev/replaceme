"use client";

import React from "react";
import { ChatMessage } from "@/types/messaging";

interface MessageBubbleProps {
  message: ChatMessage;
  currentUserId: string;
}

export function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
  const isMe = message.sender_id === currentUserId;

  // Format message time
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  // Safe split name to get initials
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Helper to parse content and detect email links, template blocks, etc.
  const renderParsedContent = (content: string) => {
    // Split into paragraphs/sections by double newlines
    const sections = content.split(/\n\n+/);

    return sections.map((section, idx) => {
      const trimmed = section.trim();

      // Check if it's the "Email Subject Format" block
      if (
        trimmed.toLowerCase().includes("email subject format:") ||
        (trimmed.startsWith("[") && trimmed.includes("] - [") && trimmed.endsWith("]"))
      ) {
        return (
          <div
            key={idx}
            className="my-3 p-4 bg-slate-50 border border-slate-200/60 rounded-xl font-mono text-[12px] text-slate-700 leading-relaxed select-all"
          >
            {trimmed.split("\n").map((line, lidx) => (
              <div key={lidx}>{line}</div>
            ))}
          </div>
        );
      }

      // Check if it's the application template form
      if (
        trimmed.toUpperCase().includes("FULL NAME:") ||
        trimmed.toUpperCase().includes("JOB POSITION YOU APPLIED FOR:")
      ) {
        return (
          <div
            key={idx}
            className="my-3 p-4 bg-slate-50 border border-slate-200/60 rounded-xl font-mono text-[12px] text-slate-700 leading-relaxed whitespace-pre-wrap select-all"
          >
            {trimmed}
          </div>
        );
      }

      // General paragraph formatting with link parsing (emails, websites)
      const lines = trimmed.split("\n");
      return (
        <p key={idx} className="text-[14px] leading-relaxed text-slate-700 font-medium mb-3 last:mb-0">
          {lines.map((line, lidx) => {
            // Match emails and links
            const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
            const urlRegex = /(https?:\/\/[^\s]+)/gi;

            let parsedLine: React.ReactNode = line;

            if (emailRegex.test(line)) {
              const parts = line.split(emailRegex);
              parsedLine = parts.map((part, pidx) => {
                if (emailRegex.test(part)) {
                  return (
                    <a
                      key={pidx}
                      href={`mailto:${part}`}
                      className="text-[#006e2f] hover:underline font-semibold"
                    >
                      {part}
                    </a>
                  );
                }
                return part;
              });
            } else if (urlRegex.test(line)) {
              const parts = line.split(urlRegex);
              parsedLine = parts.map((part, pidx) => {
                if (urlRegex.test(part)) {
                  return (
                    <a
                      key={pidx}
                      href={part}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#006e2f] hover:underline font-semibold"
                    >
                      {part}
                    </a>
                  );
                }
                return part;
              });
            }

            return (
              <React.Fragment key={lidx}>
                {parsedLine}
                {lidx < lines.length - 1 && <br />}
              </React.Fragment>
            );
          })}
        </p>
      );
    });
  };

  const senderName = message.sender?.full_name || "User";
  const initials = getInitials(senderName);

  if (isMe) {
    return (
      <div className="flex flex-col items-end w-full mb-6 last:mb-2 max-w-[85%] sm:max-w-[70%] ml-auto">
        {/* Chat Bubble card */}
        <div className="w-full bg-[#e8f5e9]/55 border border-[#c8e6c9]/40 rounded-2xl p-5 shadow-xs">
          {renderParsedContent(message.content)}
        </div>

        {/* Footer Details */}
        <div className="flex items-center gap-1.5 mt-2 mr-1">
          <span className="text-[11px] font-semibold text-slate-400">
            {formatTime(message.created_at)}
          </span>
          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#e8f5e9] text-[#006e2f] font-semibold text-[9px]">
            {initials}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start w-full mb-6 last:mb-2 max-w-[85%] sm:max-w-[72%] mr-auto">
      <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        {renderParsedContent(message.content)}
      </div>

      <div className="flex items-center gap-1.5 mt-2 ml-1">
        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#e8f5e9] text-[#006e2f] font-bold text-[9px]">
          {initials}
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}
