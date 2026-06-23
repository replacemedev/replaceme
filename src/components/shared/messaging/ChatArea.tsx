"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import {
  Pin,
  FolderOpen,
  Calendar,
  MoreVertical,
} from "lucide-react";
import { MessagingMessage, MessagingThread } from "@/types/messaging";
import { MessageBubble } from "./MessageBubble";
import { ChatInputArea } from "./ChatInputArea";
import { MessagingEmptyState } from "./MessagingEmptyState";

interface ChatAreaProps {
  thread: MessagingThread | null;
  messages: MessagingMessage[];
  currentUserId: string;
  onSendMessage: (content: string) => Promise<void>;
  onTogglePin: () => Promise<void>;
}

export function ChatArea({
  thread,
  messages,
  currentUserId,
  onSendMessage,
  onTogglePin,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPinning, setIsPinning] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  if (!thread) {
    return (
      <section className="flex-1 flex items-center justify-center bg-slate-50/50 min-w-0">
        <MessagingEmptyState />
      </section>
    );
  }

  const { oppositeParty, jobTitle } = thread;
  const headerTitle = jobTitle || "Application Conversation";
  const initials = oppositeParty.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="flex-1 flex flex-col h-full bg-[#f8fafd]/40 min-w-0">
      <header className="shrink-0 h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
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
              <span>{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-sm md:text-base truncate">
              {headerTitle}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500 font-semibold truncate">
                {oppositeParty.name}
              </span>
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#006e2f] text-[9px] font-bold">
                <span className="w-1 h-1 rounded-full bg-[#006e2f] animate-pulse" />
                Online
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={async () => {
              setIsPinning(true);
              await onTogglePin();
              setIsPinning(false);
            }}
            disabled={isPinning}
            className={`p-2 rounded-lg cursor-pointer disabled:opacity-50 ${
              thread.is_pinned
                ? "text-[#006e2f]"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
            aria-label="Pin conversation"
          >
            <Pin className={`h-4.5 w-4.5 ${thread.is_pinned ? "fill-current" : ""}`} />
          </button>
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            aria-label="Categorize"
          >
            <FolderOpen className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            aria-label="Schedule"
          >
            <Calendar className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            aria-label="More"
          >
            <MoreVertical className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 min-h-0">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-12">
            No messages yet. Send one below to start the conversation.
          </p>
        ) : (
          <>
            <p className="text-center text-[10px] uppercase font-bold text-slate-400 bg-slate-100/80 px-3 py-1 rounded-full w-fit mx-auto mb-6">
              Today
            </p>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                currentUserId={currentUserId}
              />
            ))}
          </>
        )}
      </div>

      <ChatInputArea onSendMessage={onSendMessage} />
    </section>
  );
}
