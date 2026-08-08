"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import type { MessagingMessage } from "@/types/messaging";
import { MessageBubble } from "./MessageBubble";

const VIRTUOSO_START_INDEX = 100_000;

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

function isNewDay(current: MessagingMessage, previous: MessagingMessage | undefined) {
  if (!previous) return true;
  return (
    new Date(current.created_at).toDateString() !==
    new Date(previous.created_at).toDateString()
  );
}

interface VirtualizedMessageListProps {
  messages: MessagingMessage[];
  currentUserId: string;
  hasMore: boolean;
  isLoadingOlder: boolean;
  emptyLabel: string;
  onLoadOlder: () => void;
  /** Bumps when the active thread changes so Virtuoso remounts cleanly. */
  threadKey: string;
  showQuickApply?: boolean;
}

export function VirtualizedMessageList({
  messages,
  currentUserId,
  hasMore,
  isLoadingOlder,
  emptyLabel,
  onLoadOlder,
  threadKey,
  showQuickApply = false,
}: VirtualizedMessageListProps) {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [firstItemIndex, setFirstItemIndex] = useState(VIRTUOSO_START_INDEX);
  const prevFirstIdRef = useRef<string | undefined>(messages[0]?.id);
  const prevLengthRef = useRef(messages.length);

  useEffect(() => {
    setFirstItemIndex(VIRTUOSO_START_INDEX);
    prevFirstIdRef.current = messages[0]?.id;
    prevLengthRef.current = messages.length;
    // Only reset index window when switching threads.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- threadKey is the intentional reset signal
  }, [threadKey]);

  useEffect(() => {
    const firstId = messages[0]?.id;
    const prevFirst = prevFirstIdRef.current;
    const prevLen = prevLengthRef.current;

    if (
      firstId &&
      prevFirst &&
      firstId !== prevFirst &&
      messages.length > prevLen
    ) {
      const added = messages.length - prevLen;
      setFirstItemIndex((prev) => prev - added);
    }

    prevFirstIdRef.current = firstId;
    prevLengthRef.current = messages.length;
  }, [messages]);

  const handleStartReached = useCallback(() => {
    if (!hasMore || isLoadingOlder) return;
    onLoadOlder();
  }, [hasMore, isLoadingOlder, onLoadOlder]);

  if (messages.length === 0) {
    return (
      <p className="text-center text-sm text-slate-400 py-12">{emptyLabel}</p>
    );
  }

  return (
    <Virtuoso
      key={threadKey}
      ref={virtuosoRef}
      className="h-full"
      data={messages}
      firstItemIndex={firstItemIndex}
      initialTopMostItemIndex={messages.length - 1}
      followOutput="smooth"
      startReached={handleStartReached}
      increaseViewportBy={{ top: 240, bottom: 240 }}
      computeItemKey={(_, message) => message.id}
      components={{
        Header: () =>
          hasMore || isLoadingOlder ? (
            <div className="py-3 text-center text-[11px] font-semibold text-slate-400">
              {isLoadingOlder
                ? "Loading earlier messages…"
                : "Scroll for older messages"}
            </div>
          ) : (
            <div className="h-2" />
          ),
      }}
      itemContent={(index, message) => {
        const dataIndex = index - firstItemIndex;
        const previous = messages[dataIndex - 1];
        const showSeparator = isNewDay(message, previous);

        return (
          <div className="px-1">
            {showSeparator ? (
              <p className="text-center text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-6 mt-2">
                {formatDateSeparator(message.created_at)}
              </p>
            ) : null}
            <MessageBubble
              message={message}
              currentUserId={currentUserId}
              showQuickApply={showQuickApply}
            />
          </div>
        );
      }}
    />
  );
}
