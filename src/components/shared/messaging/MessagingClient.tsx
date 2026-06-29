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
import { ChatAreaSkeleton } from "./ChatAreaSkeleton";
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
  messagingEnabled?: boolean;
  planSlug?: string;
}

export function MessagingClient({
  role,
  basePath,
  threads,
  availableJobRoles,
  initialMessages,
  selectedThreadId,
  currentUserId,
  messagingEnabled = true,
  planSlug = "discovery",
}: MessagingClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startRefresh] = useTransition();
  const [isNavigating, startNavigation] = useTransition();

  const [messages, setMessages] = useState(initialMessages);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "pinned">("all");
  const [selectedJobRole, setSelectedJobRole] =
    useState<JobRoleFilterValue>(ALL_JOB_ROLES);
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
    setPendingThreadId(null);
  }, [initialMessages]);

  useEffect(() => {
    if (!selectedThreadId) return;
    markMessagingThreadRead(selectedThreadId, basePath).then(() => {
      startRefresh(() => router.refresh());
    });
  }, [selectedThreadId, basePath, router]);

  const handleBackToInbox = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("threadId");
    const qs = params.toString();
    setPendingThreadId(null);
    startNavigation(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const handleSelectThread = (threadId: string) => {
    if (threadId === selectedThreadId) return;
    setPendingThreadId(threadId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("threadId", threadId);
    startNavigation(() => {
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

    startRefresh(() => router.refresh());
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
      startRefresh(() => router.refresh());
    }
  };

  const activeThread =
    threads.find((t) => t.id === selectedThreadId) ?? null;

  const mobileChatOpen = Boolean(selectedThreadId);
  const isLoadingThread =
    Boolean(selectedThreadId) &&
    (isNavigating || pendingThreadId === selectedThreadId);

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
        role={role}
        mobileHidden={mobileChatOpen}
      />
      {isLoadingThread ? (
        <ChatAreaSkeleton mobileHidden={!mobileChatOpen} />
      ) : (
        <ChatArea
          thread={activeThread}
          messages={messages}
          currentUserId={currentUserId}
          role={role}
          messagingEnabled={messagingEnabled}
          planSlug={planSlug}
          onSendMessage={handleSendMessage}
          onTogglePin={handleTogglePin}
          onBack={mobileChatOpen ? handleBackToInbox : undefined}
          mobileHidden={!mobileChatOpen}
        />
      )}
    </MessagingCenterShell>
  );
}
