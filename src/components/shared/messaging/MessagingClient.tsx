"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ALL_JOB_ROLES,
  JobRoleFilterValue,
  MessagingJobRole,
  MessagingMessage,
  MessagingMessagesPage,
  MessagingRole,
  MessagingThread,
  MESSAGING_THREADS_PAGE_SIZE,
} from "@/types/messaging";
import { InboxSidebar } from "./InboxSidebar";
import { ChatArea } from "./ChatArea";
import { ChatAreaSkeleton } from "./ChatAreaSkeleton";
import { MessagingCenterShell } from "./MessagingCenterShell";
import {
  sendMessagingMessage,
  markMessagingThreadRead,
  toggleMessagingThreadPin,
  deleteConversation,
  toggleUnreadStatus,
  loadOlderMessagingMessages,
  getMessagingThreadsPage,
} from "@/actions/messaging";
import { useMessagingThreadRealtime } from "@/hooks/useMessagingThreadRealtime";
import { useMessagingInboxRealtime } from "@/hooks/useMessagingInboxRealtime";

interface ThreadMessagesCache {
  messages: MessagingMessage[];
  hasMore: boolean;
  nextCursor: string | null;
}

interface MessagingClientProps {
  role: MessagingRole;
  basePath: string;
  threads: MessagingThread[];
  availableJobRoles: MessagingJobRole[];
  initialMessagesPage: MessagingMessagesPage;
  selectedThreadId: string | null;
  currentUserId: string;
  companyProfileId?: string | null;
  initialHasMoreThreads?: boolean;
  messagingEnabled?: boolean;
  planSlug?: string;
}

export function MessagingClient({
  role,
  basePath,
  threads: initialThreads,
  availableJobRoles,
  initialMessagesPage,
  selectedThreadId,
  currentUserId,
  companyProfileId = null,
  initialHasMoreThreads = false,
  messagingEnabled = true,
  planSlug = "discovery",
}: MessagingClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startRefresh] = useTransition();
  const [isNavigating, startNavigation] = useTransition();

  const [threads, setThreads] = useState(initialThreads);
  const [hasMoreThreads, setHasMoreThreads] = useState(initialHasMoreThreads);
  const [isLoadingMoreThreads, setIsLoadingMoreThreads] = useState(false);
  const [messages, setMessages] = useState(initialMessagesPage.messages);
  const [hasMoreMessages, setHasMoreMessages] = useState(
    initialMessagesPage.hasMore
  );
  const [nextCursor, setNextCursor] = useState(initialMessagesPage.nextCursor);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "pinned">("all");
  const [selectedJobRole, setSelectedJobRole] =
    useState<JobRoleFilterValue>(ALL_JOB_ROLES);
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null);

  const messagesCacheRef = useRef<Map<string, ThreadMessagesCache>>(new Map());

  useEffect(() => {
    setThreads(initialThreads);
    setHasMoreThreads(initialHasMoreThreads);
  }, [initialThreads, initialHasMoreThreads]);

  useEffect(() => {
    setMessages(initialMessagesPage.messages);
    setHasMoreMessages(initialMessagesPage.hasMore);
    setNextCursor(initialMessagesPage.nextCursor);
    setPendingThreadId(null);

    if (selectedThreadId) {
      messagesCacheRef.current.set(selectedThreadId, {
        messages: initialMessagesPage.messages,
        hasMore: initialMessagesPage.hasMore,
        nextCursor: initialMessagesPage.nextCursor,
      });
    }
  }, [initialMessagesPage, selectedThreadId]);

  useEffect(() => {
    if (!selectedThreadId) return;
    markMessagingThreadRead(selectedThreadId, basePath).then(() => {
      startRefresh(() => router.refresh());
    });
  }, [selectedThreadId, basePath, router]);

  const handleRealtimeMessage = useCallback(
    (message: MessagingMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        const next = [...prev, message];
        if (selectedThreadId) {
          const cached = messagesCacheRef.current.get(selectedThreadId);
          messagesCacheRef.current.set(selectedThreadId, {
            messages: next,
            hasMore: cached?.hasMore ?? hasMoreMessages,
            nextCursor: cached?.nextCursor ?? nextCursor,
          });
        }
        return next;
      });
      startRefresh(() => router.refresh());
    },
    [selectedThreadId, hasMoreMessages, nextCursor, router]
  );

  useMessagingThreadRealtime(
    selectedThreadId,
    currentUserId,
    handleRealtimeMessage
  );

  useMessagingInboxRealtime(role, currentUserId, companyProfileId, () => {
    startRefresh(() => router.refresh());
  });

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

    const cached = messagesCacheRef.current.get(threadId);
    if (cached) {
      setMessages(cached.messages);
      setHasMoreMessages(cached.hasMore);
      setNextCursor(cached.nextCursor);
    }

    setPendingThreadId(threadId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("threadId", threadId);
    startNavigation(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleLoadOlderMessages = async () => {
    if (!selectedThreadId || !nextCursor || isLoadingOlder || !hasMoreMessages) {
      return;
    }
    setIsLoadingOlder(true);
    try {
      const page = await loadOlderMessagingMessages(
        selectedThreadId,
        nextCursor
      );
      if (page.messages.length === 0) {
        setHasMoreMessages(false);
        return;
      }

      setMessages((prev) => {
        const existing = new Set(prev.map((m) => m.id));
        const older = page.messages.filter((m) => !existing.has(m.id));
        const merged = [...older, ...prev];
        messagesCacheRef.current.set(selectedThreadId, {
          messages: merged,
          hasMore: page.hasMore,
          nextCursor: page.nextCursor,
        });
        return merged;
      });
      setHasMoreMessages(page.hasMore);
      setNextCursor(page.nextCursor);
    } finally {
      setIsLoadingOlder(false);
    }
  };

  const handleLoadMoreThreads = async () => {
    if (!hasMoreThreads || isLoadingMoreThreads) return;
    setIsLoadingMoreThreads(true);
    try {
      const page = await getMessagingThreadsPage(
        role,
        threads.length,
        MESSAGING_THREADS_PAGE_SIZE
      );
      setThreads((prev) => {
        const existing = new Set(prev.map((t) => t.id));
        return [...prev, ...page.threads.filter((t) => !existing.has(t.id))];
      });
      setHasMoreThreads(page.hasMore);
    } finally {
      setIsLoadingMoreThreads(false);
    }
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

  const handleMarkUnread = async () => {
    if (!selectedThreadId) return;
    const result = await toggleUnreadStatus(selectedThreadId, basePath);
    if (result.success) {
      handleBackToInbox();
    } else {
      alert(result.error || "Failed to mark as unread");
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedThreadId) return;
    const result = await deleteConversation(selectedThreadId, basePath);
    if (result.success) {
      messagesCacheRef.current.delete(selectedThreadId);
      handleBackToInbox();
    } else {
      alert(result.error || "Failed to delete conversation");
    }
  };

  const activeThread = threads.find((t) => t.id === selectedThreadId) ?? null;

  const mobileChatOpen = Boolean(selectedThreadId);
  const isLoadingThread =
    Boolean(selectedThreadId) &&
    (isNavigating || pendingThreadId === selectedThreadId) &&
    !messagesCacheRef.current.has(selectedThreadId ?? "");

  return (
    <MessagingCenterShell>
      <Suspense
        fallback={
          <div className="w-full lg:w-[320px] shrink-0 border-r border-slate-200 bg-white animate-pulse" />
        }
      >
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
          hasMoreThreads={hasMoreThreads}
          isLoadingMoreThreads={isLoadingMoreThreads}
          onLoadMoreThreads={handleLoadMoreThreads}
        />
      </Suspense>
      {isLoadingThread ? (
        <ChatAreaSkeleton mobileHidden={!mobileChatOpen} />
      ) : (
        <Suspense fallback={<ChatAreaSkeleton mobileHidden={!mobileChatOpen} />}>
          <ChatArea
            thread={activeThread}
            messages={messages}
            currentUserId={currentUserId}
            role={role}
            messagingEnabled={messagingEnabled}
            planSlug={planSlug}
            hasMoreMessages={hasMoreMessages}
            isLoadingOlder={isLoadingOlder}
            onLoadOlderMessages={handleLoadOlderMessages}
            onSendMessage={handleSendMessage}
            onTogglePin={handleTogglePin}
            onMarkUnread={handleMarkUnread}
            onDeleteConversation={handleDeleteConversation}
            onBack={mobileChatOpen ? handleBackToInbox : undefined}
            mobileHidden={!mobileChatOpen}
          />
        </Suspense>
      )}
    </MessagingCenterShell>
  );
}
