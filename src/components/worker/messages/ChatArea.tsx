"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Pin, FolderOpen, Calendar, MoreVertical, MessageSquare } from "lucide-react";
import { ChatThread, ChatMessage } from "@/types/messaging";
import { MessageBubble } from "./MessageBubble";
import { ChatInputArea } from "./ChatInputArea";
import { EmptyState } from "@/components/shared/EmptyState";

interface ChatAreaProps {
  thread: ChatThread | null;
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (content: string) => Promise<void>;
  onTogglePin: () => Promise<void>;
}

export function ChatArea({
  thread,
  messages,
  currentUserId,
  onSendMessage,
  onTogglePin,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPinning, setIsPinning] = useState(false);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/50">
        <EmptyState
          icon={<MessageSquare className="h-6 w-6" />}
          title="No Conversation Selected"
          description="Select an employer thread from the sidebar to view messages, share files, and schedule meetings."
        />
      </div>
    );
  }

  const companyName = thread.company_profiles?.company_name || "Employer";
  const logoUrl = thread.company_profiles?.logo_url;
  const initials = companyName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  
  const jobTitle = thread.jobs?.title || "Application Conversation";

  const handlePinClick = async () => {
    try {
      setIsPinning(true);
      await onTogglePin();
    } catch (err) {
      console.error("Error pinning thread:", err);
    } finally {
      setIsPinning(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafd]/40 min-w-0">
      
      {/* Sticky Header */}
      <header className="shrink-0 h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between select-none">
        
        {/* Left Side: Avatar, Title and Online Pill */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[#e8f5e9] text-[#006e2f] font-semibold text-sm">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={companyName}
                fill
                className="rounded-full object-cover"
                sizes="40px"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-sm md:text-base leading-snug truncate">
              {jobTitle}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500 font-semibold truncate max-w-[120px] sm:max-w-[200px]">
                {companyName}
              </span>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#006e2f] text-[9px] font-bold">
                <span className="w-1 h-1 rounded-full bg-[#006e2f] animate-pulse" />
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Options Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handlePinClick}
            disabled={isPinning}
            className={`p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
              thread.is_pinned ? "text-[#006e2f] hover:text-[#005c26]" : ""
            }`}
            aria-label="Pin conversation"
          >
            <Pin className={`h-4.5 w-4.5 ${thread.is_pinned ? "fill-current" : ""}`} />
          </button>
          
          <button
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            aria-label="Categorize thread"
          >
            <FolderOpen className="h-4.5 w-4.5" />
          </button>
          
          <button
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            aria-label="Schedule interview"
          >
            <Calendar className="h-4.5 w-4.5" />
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block" />

          <button
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            aria-label="More options"
          >
            <MoreVertical className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* Message History area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 min-h-0 flex flex-col"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/40 border border-slate-100 rounded-xl my-4">
            <p className="text-sm font-medium text-slate-400">
              No messages in this conversation. Send a message below to start chatting.
            </p>
          </div>
        ) : (
          <>
            {/* Center-aligned Date Separator */}
            <div className="flex items-center justify-center my-6">
              <span className="text-[10px] tracking-wider uppercase font-bold text-slate-400 bg-slate-100/80 px-3 py-1 rounded-full">
                TODAY, {new Date(messages[0]?.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </span>
            </div>

            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                currentUserId={currentUserId}
              />
            ))}
          </>
        )}
      </div>

      {/* Chat Input */}
      <ChatInputArea
        onSendMessage={onSendMessage}
      />
    </div>
  );
}
