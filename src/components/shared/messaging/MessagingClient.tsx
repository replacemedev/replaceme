"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  MessagingMessage,
  MessagingRole,
  MessagingThread,
} from "@/types/messaging";
import { InboxSidebar } from "./InboxSidebar";
import { ChatArea } from "./ChatArea";
import {
  sendMessagingMessage,
  markMessagingThreadRead,
  toggleMessagingThreadPin,
} from "@/actions/messaging";

interface MessagingClientProps {
  role: MessagingRole;
  basePath: string;
  threads: MessagingThread[];
  initialMessages: MessagingMessage[];
  selectedThreadId: string | null;
  currentUserId: string;
}

export function MessagingClient({
  role,
  basePath,
  threads,
  initialMessages,
  selectedThreadId,
  currentUserId,
}: MessagingClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [messages, setMessages] = useState(initialMessages);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "pinned">("all");

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!selectedThreadId) return;
    markMessagingThreadRead(selectedThreadId, basePath).then(() => {
      startTransition(() => router.refresh());
    });
  }, [selectedThreadId, basePath, router]);

  const handleSelectThread = (threadId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("threadId", threadId);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedThreadId) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic: MessagingMessage = {
      id: tempId,
      thread_id: selectedThreadId,
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
      read_at: null,
      sender: {
        id: currentUserId,
        full_name: "You",
        avatar_url: null,
        role,
      },
    };

    setMessages((prev) => [...prev, optimistic]);

    const result = await sendMessagingMessage(
      selectedThreadId,
      content,
      basePath
    );

    if (!result.success) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert(result.error || "Failed to send message");
      return;
    }

    startTransition(() => router.refresh());
  };

  const handleTogglePin = async () => {
    if (!selectedThreadId) return;
    const thread = threads.find((t) => t.id === selectedThreadId);
    if (!thread) return;

    const result = await toggleMessagingThreadPin(
      selectedThreadId,
      !thread.is_pinned,
      basePath
    );
    if (result.success) {
      startTransition(() => router.refresh());
    }
  };

  const activeThread =
    threads.find((t) => t.id === selectedThreadId) ?? null;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 border-x border-slate-200 max-w-7xl mx-auto">
      <InboxSidebar
        threads={threads}
        selectedThreadId={selectedThreadId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSelectThread={handleSelectThread}
      />
      <ChatArea
        thread={activeThread}
        messages={messages}
        currentUserId={currentUserId}
        onSendMessage={handleSendMessage}
        onTogglePin={handleTogglePin}
      />
    </div>
  );
}
