"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { Pin, Tag, Archive, MoreVertical } from "lucide-react";
import { AvatarImage } from "@/components/shared/media/AvatarImage";
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
  const [showMenu, setShowMenu] = useState(false);
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
  const employerHasMessaged = messages.some(
    (message) => message.sender_id !== currentUserId
  );
  const waitingForEmployer =
    role === "worker" && !isBlocked && !employerHasMessaged;
  const canCompose = !isBlocked && !waitingForEmployer;

  return (
    <section
      className={`flex-1 flex flex-col h-full bg-[#f8fafd]/40 min-w-0 ${
        mobileHidden ? "hidden lg:flex" : ""
      }`}
    >
      <header className="relative shrink-0 h-16 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {onBack ? <MobileChatBackButton onBack={onBack} /> : null}
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#e8f5e9]">
            <AvatarImage
              src={oppositeParty.avatarUrl}
              alt={oppositeParty.name}
              initials={initials}
              size="xs"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-sm md:text-base truncate">
              {contextTitle}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
              <span className="text-xs text-slate-500 font-semibold truncate">
                {oppositeParty.name}
              </span>
            </div>
          </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0 relative">
          <button
            type="button"
            onClick={async () => {
              setIsPinning(true);
              await onTogglePin();
              setIsPinning(false);
            }}
            disabled={isPinning}
            className={`hidden sm:inline-flex p-2 rounded-lg cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 ${
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
            className="hidden sm:inline-flex p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            aria-label="Tag conversation"
          >
            <Tag className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            className="hidden sm:inline-flex p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            aria-label="Archive conversation"
          >
            <Archive className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            aria-label="More options"
          >
            <MoreVertical className="h-4.5 w-4.5" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-10 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
                <button
                  type="button"
                  onClick={async () => {
                    setShowMenu(false);
                    setIsPinning(true);
                    await onTogglePin();
                    setIsPinning(false);
                  }}
                  disabled={isPinning}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 sm:hidden cursor-pointer disabled:opacity-50"
                >
                  <Pin className={`h-3.5 w-3.5 ${thread.is_pinned ? "fill-current text-[#006e2f]" : ""}`} />
                  {thread.is_pinned ? "Unpin conversation" : "Pin conversation"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMenu(false)}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 sm:hidden cursor-pointer"
                >
                  <Tag className="h-3.5 w-3.5" />
                  Tag conversation
                </button>
                <button
                  type="button"
                  onClick={() => setShowMenu(false)}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 sm:hidden cursor-pointer"
                >
                  <Archive className="h-3.5 w-3.5" />
                  Archive conversation
                </button>
                <div className="h-px bg-slate-100 my-1 sm:hidden" />
                <button
                  type="button"
                  onClick={() => setShowMenu(false)}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  Mark as unread
                </button>
                <button
                  type="button"
                  onClick={() => setShowMenu(false)}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-semibold"
                >
                  Block user
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {isBlocked && role === "worker" ? (
        <MessagingThreadStatus
          blockedReason={thread.blocked_reason ?? "messaging_disabled"}
          role={role}
          planSlug={planSlug}
        />
      ) : null}

      {waitingForEmployer ? (
        <div
          className="mx-4 mt-4 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-sm"
          role="status"
        >
          <p className="text-sm font-bold text-slate-900">Waiting for employer</p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
            The employer will message you first about this application. You can reply
            here once they send the opening message.
          </p>
        </div>
      ) : null}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-12">
            {role === "employer"
              ? "Send the first message below to start the conversation."
              : "No messages yet."}
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

      {canCompose ? (
        <ChatInputArea onSendMessage={onSendMessage} />
      ) : isBlocked ? (
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
        <div className="shrink-0 border-t border-slate-200 bg-slate-50/80 px-4 py-4">
          <p className="text-center text-xs font-medium text-slate-500">
            Reply unlocks after the employer sends the first message.
          </p>
        </div>
      )}
    </section>
  );
}
