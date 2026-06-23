"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ALL_JOB_ROLES,
  JobRoleFilterValue,
  MessagingJobRole,
  MessagingMessage,
  MessagingRole,
  MessagingThread,
} from "@/types/messaging";
import { InboxSidebar } from "./InboxSidebar";
import { ChatArea } from "./ChatArea";
import { MessagingCenterShell } from "./MessagingCenterShell";
import {
  sendMessagingMessage,
  markMessagingThreadRead,
  toggleMessagingThreadPin,
} from "@/actions/messaging";

interface MessagingClientProps {
  role: MessagingRole;
  basePath: string;
  threads: MessagingThread[];
  availableJobRoles: MessagingJobRole[];
  initialMessages: MessagingMessage[];
  selectedThreadId: string | null;
  currentUserId: string;
}

export function MessagingClient({
  role,
  basePath,
  threads,
  availableJobRoles,
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
  const [selectedJobRole, setSelectedJobRole] =
    useState<JobRoleFilterValue>(ALL_JOB_ROLES);

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
    <MessagingCenterShell>
      <InboxSidebar
        threads={threads}
        selectedThreadId={selectedThreadId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        availableJobRoles={availableJobRoles}
        selectedJobRole={selectedJobRole}
        onJobRoleChange={setSelectedJobRole}
        onSelectThread={handleSelectThread}
      />
      <ChatArea
        thread={activeThread}
        messages={messages}
        currentUserId={currentUserId}
        onSendMessage={handleSendMessage}
        onTogglePin={handleTogglePin}
      />
    </MessagingCenterShell>
  );
}
