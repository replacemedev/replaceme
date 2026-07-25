"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MessagingRole } from "@/types/messaging";

/**
 * Inbox-level realtime: listen only to this user's chat_threads rows
 * (not the global messages table). Triggers a lightweight refresh callback.
 */
export function useMessagingInboxRealtime(
  role: MessagingRole,
  userId: string,
  companyProfileId: string | null,
  onThreadChange: () => void
) {
  const onChangeRef = useRef(onThreadChange);
  onChangeRef.current = onThreadChange;
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const filter =
      role === "worker"
        ? `worker_id=eq.${userId}`
        : companyProfileId
          ? `company_profile_id=eq.${companyProfileId}`
          : null;

    if (!filter) return;

    const supabase = supabaseRef.current;
    const channelName = `chat_threads:${role}:${userId}:${crypto.randomUUID()}`;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        onChangeRef.current();
      }, 250);
    };

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_threads",
          filter,
        },
        scheduleRefresh
      )
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      void supabase.removeChannel(channel);
    };
  }, [role, userId, companyProfileId]);
}
