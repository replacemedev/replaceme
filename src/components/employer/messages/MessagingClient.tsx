"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Conversation, Message } from "@/types/employer/messages";
import { ConversationSidebar } from "./ConversationSidebar";
import { ChatWindow } from "./ChatWindow";
import { sendMessage } from "@/actions/employer/messages";

interface MessagingClientProps {
  conversations: Conversation[];
  initialMessages: Message[];
  activeId: string | null;
  subscriptionTier: "discovery" | "essential" | "professional";
  currentUserId: string;
}

export function MessagingClient({
  conversations,
  initialMessages,
  activeId,
  subscriptionTier,
  currentUserId,
}: MessagingClientProps) {
  const router = useRouter();

  // Local state for role filtering
  const [selectedRole, setSelectedRole] = useState("All Roles");
  // Local state for messages to support optimistic updates
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  // Local state for conversations to instantly update snippet on message send
  const [localConversations, setLocalConversations] = useState<Conversation[]>(conversations);

  // Synchronize state when page data is re-fetched/re-validated
  useEffect(() => {
    setMessages(initialMessages);
  }, [activeId, initialMessages]);

  useEffect(() => {
    setLocalConversations(conversations);
  }, [conversations]);

  const activeThread = localConversations.find((t) => t.id === activeId) || null;

  const handleSelectThread = (id: string) => {
    router.push(`/messages?id=${id}`);
  };

  const handleBack = () => {
    router.push("/messages");
  };

  const handleSendMessage = async (content: string) => {
    if (!activeId) return;

    const tempId = Math.random().toString();
    const optimisticMessage: Message = {
      id: tempId,
      conversationId: activeId,
      senderId: currentUserId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      status: "sent",
      senderName: "Employer",
      senderAvatarUrl: null,
      readReceipt: false,
    };

    // Optimistically push the message into active thread history
    setMessages((prev) => [...prev, optimisticMessage]);

    // Optimistically update the sidebar last message snippet
    setLocalConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeId
          ? {
              ...conv,
              lastMessageSnippet: content.trim(),
              updatedAt: new Date().toISOString(),
            }
          : conv
      )
    );

    try {
      const result = await sendMessage(activeId, content);
      if (result.success && result.message) {
        // Replace the optimistic message with the database saved row
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? result.message! : msg))
        );
      } else {
        // Rollback optimistic updates on failure
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        alert(result.error || "Failed to send message. Please try again.");
      }
    } catch (err) {
      // Rollback optimistic updates on connection failure
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      alert("An error occurred. Please check your connection and try again.");
    }
  };

  return (
    <div className="flex bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-[calc(100vh-10rem)] min-h-[500px]">
      {/* Sidebar Thread List - Column */}
      <div className={`w-full md:w-auto shrink-0 md:flex ${activeId ? "hidden md:flex" : "flex"}`}>
        <ConversationSidebar
          conversations={localConversations}
          activeId={activeId}
          onSelectThread={handleSelectThread}
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
        />
      </div>

      {/* Chat Window - Column */}
      <div className={`flex-1 flex flex-col ${activeId ? "flex" : "hidden md:flex"}`}>
        <ChatWindow
          activeThread={activeThread}
          messages={messages}
          subscriptionTier={subscriptionTier}
          currentUserId={currentUserId}
          onSendMessage={handleSendMessage}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
