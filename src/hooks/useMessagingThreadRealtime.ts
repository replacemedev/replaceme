"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessageKind, MessagingMessage } from "@/types/messaging";

type MessageRowPayload = {
  id: string;
  thread_id: string;
  sender_id: string | null;
  content: string;
  created_at: string;
  read_at: string | null;
  message_kind?: string | null;
  payload?: Record<string, unknown> | null;
};

function mapRowToMessage(row: MessageRowPayload): MessagingMessage | null {
  if (!row?.id) return null;
  const kind: ChatMessageKind =
    row.message_kind === "system_match" ? "system_match" : "user";
  const payload =
    row.payload && typeof row.payload === "object" && !Array.isArray(row.payload)
      ? row.payload
      : null;

  return {
    id: row.id,
    thread_id: row.thread_id,
    sender_id: row.sender_id,
    content: row.content,
    created_at: row.created_at,
    read_at: row.read_at,
    message_kind: kind,
    payload,
    sender: null,
  };
}

/**
 * Subscribe to the active conversation's chat_messages channel.
 * Handles INSERT (new messages / new skill matches) and UPDATE
 * (skill-match score / overlapping skills refresh).
 */
export function useMessagingThreadRealtime(
  threadId: string | null,
  currentUserId: string,
  onInsert: (message: MessagingMessage) => void,
  onUpdate?: (message: MessagingMessage) => void
) {
  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  onInsertRef.current = onInsert;
  onUpdateRef.current = onUpdate;
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (!threadId) return;

    const supabase = supabaseRef.current;
    const channelName = `chat_messages:${threadId}:${crypto.randomUUID()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const row = payload.new as MessageRowPayload;
          // Skip own user messages; allow system_match (sender_id null).
          if (row?.sender_id && row.sender_id === currentUserId) return;
          const message = mapRowToMessage(row);
          if (!message) return;
          onInsertRef.current(message);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const row = payload.new as MessageRowPayload;
          const message = mapRowToMessage(row);
          if (!message) return;
          onUpdateRef.current?.(message);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [threadId, currentUserId]);
}
