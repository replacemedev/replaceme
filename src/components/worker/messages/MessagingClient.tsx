"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChatThread, ChatMessage } from "@/types/messaging";
import { InboxSidebar } from "./InboxSidebar";
import { ChatArea } from "./ChatArea";
import { sendWorkerMessage, togglePinThread, markThreadAsRead } from "@/actions/worker/messages";

interface MessagingClientProps {
  threads: ChatThread[];
  initialMessages: ChatMessage[];
  selectedThreadId: string | null;
  currentUserId: string;
}

export function MessagingClient({
  threads,
  initialMessages,
  selectedThreadId,
  currentUserId,
}: MessagingClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for messages (to allow optimistic/instant updates)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "pinned">("all");

  // Keep messages state in sync when initialMessages changes (server refetch)
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Mark thread as read when selected
  useEffect(() => {
    if (selectedThreadId) {
      markThreadAsRead(selectedThreadId).then(() => {
        // Trigger page refresh silently to clear badges
        startTransition(() => {
          router.refresh();
        });
      });
    }
  }, [selectedThreadId, router]);

  // Handle selecting a thread (updates URL param)
  const handleSelectThread = (threadId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("threadId", threadId);
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Handle sending a message (optimistic UI)
  const handleSendMessage = async (content: string) => {
    if (!selectedThreadId) return;

    // 1. Optimistically append message to local state
    const tempId = Math.random().toString();
    const optimisticMessage: ChatMessage = {
      id: tempId,
      thread_id: selectedThreadId,
      sender_id: currentUserId,
      content: content,
      created_at: new Date().toISOString(),
      read_at: null,
      sender: {
        id: currentUserId,
        full_name: "You",
        avatar_url: null,
        role: "worker",
      },
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // 2. Call Server Action to persist in Supabase
    const result = await sendWorkerMessage(selectedThreadId, content);

    if (!result.success) {
      // Rollback optimistic message if error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert(result.error || "Failed to send message");
    } else {
      // 3. Revalidate path via router.refresh()
      startTransition(() => {
        router.refresh();
      });
    }
  };

  // Handle pinning thread
  const handleTogglePin = async () => {
    if (!selectedThreadId) return;
    const currentThread = threads.find((t) => t.id === selectedThreadId);
    if (!currentThread) return;

    const newPinnedState = !currentThread.is_pinned;
    const result = await togglePinThread(selectedThreadId, newPinnedState);

    if (result.success) {
      startTransition(() => {
        router.refresh();
      });
    }
  };

  const activeThread = threads.find((t) => t.id === selectedThreadId) || null;

  return (
    <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      <div className="flex flex-row w-full h-full max-w-7xl mx-auto border-x border-slate-200 bg-white">
        {/* Sidebar thread listing */}
        <InboxSidebar
          threads={threads}
          selectedThreadId={selectedThreadId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSelectThread={handleSelectThread}
        />

        {/* Active conversation window */}
        <ChatArea
          thread={activeThread}
          messages={messages}
          currentUserId={currentUserId}
          onSendMessage={handleSendMessage}
          onTogglePin={handleTogglePin}
        />
      </div>
    </div>
  );
}
