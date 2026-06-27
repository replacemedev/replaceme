"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Pin, Tag, Archive, MoreVertical } from "lucide-react";
import { MessagingMessage, MessagingThread } from "@/types/messaging";
import { MessageBubble } from "./MessageBubble";
import { ChatInputArea } from "./ChatInputArea";
import { MessagingEmptyState } from "./MessagingEmptyState";
import { MessagingThreadStatus } from "./MessagingThreadStatus";
import { UnlockOverlay } from "@/components/shared/entitlements/UnlockOverlay";
import { MobileChatBackButton } from "./MobileChatBackButton";

interface ChatAreaProps {
  thread: MessagingThread | null;
  messages: MessagingMessage[];
  currentUserId: string;
  role: "worker" | "employer";
  messagingEnabled?: boolean;
  planSlug?: string;
  onSendMessage: (content: string) => Promise<void>;
  onTogglePin: () => Promise<void>;
  onBack?: () => void;
  /** Hide chat pane on mobile until a thread is selected. */
  mobileHidden?: boolean;
}

function formatDateSeparator(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (date.toDateString() === now.toDateString()) {
    return `TODAY, ${time}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `YESTERDAY, ${time}`;
  }

  const day = date
    .toLocaleDateString([], { weekday: "long" })
    .toUpperCase();
  const datePart = date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
  return `${day}, ${datePart}`;
}

function groupMessagesByDay(messages: MessagingMessage[]) {
  const groups: { dateKey: string; label: string; items: MessagingMessage[] }[] =
    [];

  for (const message of messages) {
    const dateKey = new Date(message.created_at).toDateString();
    const last = groups[groups.length - 1];
    if (last?.dateKey === dateKey) {
      last.items.push(message);
    } else {
      groups.push({
        dateKey,
        label: formatDateSeparator(message.created_at),
        items: [message],
      });
    }
  }

  return groups;
}

function partyInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ChatArea({
  thread,
  messages,
  currentUserId,
  role,
  messagingEnabled = true,
  planSlug = "discovery",
  onSendMessage,
  onTogglePin,
  onBack,
  mobileHidden = false,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPinning, setIsPinning] = useState(false);
  const messageGroups = useMemo(() => groupMessagesByDay(messages), [messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  if (!thread) {
    return (
      <section
        className={`flex-1 flex items-center justify-center bg-slate-50/50 min-w-0 p-8 ${
          mobileHidden ? "hidden lg:flex" : ""
        }`}
      >
        <MessagingEmptyState
          role={role}
          messagingEnabled={messagingEnabled}
          planSlug={planSlug}
        />
      </section>
    );
  }

  const { oppositeParty, contextTitle } = thread;
  const initials = partyInitials(oppositeParty.name);
  const isBlocked =
    Boolean(thread.blocked_reason) ||
    (role === "employer" && !messagingEnabled);

  return (
    <section
      className={`flex-1 flex flex-col h-full bg-[#f8fafd]/40 min-w-0 ${
        mobileHidden ? "hidden lg:flex" : ""
      }`}
    >
      <header className="shrink-0 h-16 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {onBack ? <MobileChatBackButton onBack={onBack} /> : null}
          <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[#e8f5e9] text-[#006e2f] font-bold text-sm overflow-hidden">
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
            <h3 className="font-bold text-slate-900 text-sm md:text-base truncate">
              {contextTitle}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500 font-semibold truncate">
                {oppositeParty.name}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#006e2f] text-[9px] font-bold uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006e2f]" />
                Online
              </span>
            </div>
          </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={async () => {
              setIsPinning(true);
              await onTogglePin();
              setIsPinning(false);
            }}
            disabled={isPinning}
            className={`p-2 rounded-lg cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 ${
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
            aria-label="Tag conversation"
          >
            <Tag className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            aria-label="Archive conversation"
          >
            <Archive className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            aria-label="More options"
          >
            <MoreVertical className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {isBlocked && role === "worker" ? (
        <MessagingThreadStatus
          blockedReason={thread.blocked_reason ?? "messaging_disabled"}
          role={role}
          planSlug={planSlug}
        />
      ) : null}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-12">
            No messages yet. Send one below to start the conversation.
          </p>
        ) : (
          messageGroups.map((group) => (
            <div key={group.dateKey} className="mb-6 last:mb-0">
              <p className="text-center text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-6">
                {group.label}
              </p>
              {group.items.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {isBlocked ? (
        <div className="shrink-0 border-t border-slate-200 bg-slate-50/80 px-4 py-4">
          {role === "employer" ? (
            <UnlockOverlay feature="messaging" currentPlan={planSlug} />
          ) : (
            <p className="text-center text-xs font-medium text-slate-500">
              This employer cannot reply until they upgrade their plan.
            </p>
          )}
        </div>
      ) : (
        <ChatInputArea onSendMessage={onSendMessage} />
      )}
    </section>
  );
}
