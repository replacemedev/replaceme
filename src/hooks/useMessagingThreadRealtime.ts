"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MessagingMessage } from "@/types/messaging";

type MessageInsertPayload = {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

/**
 * Subscribe only to the active conversation's chat_messages channel.
 * Cleans up with removeChannel on unmount / thread change.
 */
export function useMessagingThreadRealtime(
  threadId: string | null,
  currentUserId: string,
  onInsert: (message: MessagingMessage) => void
) {
  const onInsertRef = useRef(onInsert);
  onInsertRef.current = onInsert;
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
          const row = payload.new as MessageInsertPayload;
          if (!row?.id || row.sender_id === currentUserId) return;

          onInsertRef.current({
            id: row.id,
            thread_id: row.thread_id,
            sender_id: row.sender_id,
            content: row.content,
            created_at: row.created_at,
            read_at: row.read_at,
            sender: null,
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [threadId, currentUserId]);
}
