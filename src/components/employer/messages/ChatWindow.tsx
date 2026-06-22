"use client";

import React, { useEffect, useRef } from "react";
import { 
  MessageSquare, 
  ArrowUpRight, 
  ChevronLeft, 
  Mail, 
  Pin, 
  Calendar, 
  Search, 
  LayoutGrid, 
  MoreVertical,
  ShieldCheck
} from "lucide-react";
import { Conversation, Message } from "@/types/employer/messages";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";

interface ChatWindowProps {
  activeThread: Conversation | null;
  messages: Message[];
  subscriptionTier: "discovery" | "essential" | "professional";
  currentUserId: string;
  onSendMessage: (content: string) => Promise<void>;
  onBack?: () => void;
}

export function ChatWindow({
  activeThread,
  messages,
  subscriptionTier,
  currentUserId,
  onSendMessage,
  onBack,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Quick reply options
  const quickReplies = [
    "I'll review this",
    "Can we hop on a call?",
    "Please send portfolio"
  ];

  if (!activeThread) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 p-8 text-center h-full">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 border border-emerald-100/30">
          <MessageSquare size={32} className="text-emerald-600" />
        </div>
        <h3 className="font-display-md text-sm font-bold text-slate-800">No Conversation Selected</h3>
        <p className="text-xs text-slate-400 font-semibold mt-1.5 max-w-xs leading-relaxed">
          Select a candidate profile from the thread list to view messages and coordinate hiring.
        </p>
      </div>
    );
  }

  const displayName = activeThread.participantNames.join(", ") || "Candidate";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const showUpsell = subscriptionTier === "discovery" || subscriptionTier === "essential";

  // Format date header to match "TODAY, NOV 12" styling
  const getFormatDateHeader = () => {
    if (messages.length === 0) return "TODAY";
    try {
      const firstMsgDate = new Date(messages[0].createdAt);
      const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
      const formatted = firstMsgDate.toLocaleDateString("en-US", options).toUpperCase();
      
      const now = new Date();
      if (firstMsgDate.toDateString() === now.toDateString()) {
        return `TODAY, ${formatted}`;
      }
      return formatted;
    } catch (e) {
      return "TODAY";
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/20 relative">
      {/* Thread Header */}
      <div className="h-16 border-b border-slate-100 bg-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors -ml-2"
              title="Back to conversations"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm border border-slate-100 shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-800 leading-none mb-1">{displayName}</h2>
            <p className="text-[10px] font-bold text-[#22c55e] leading-none">
              {activeThread.candidateRole || "Candidate"}
            </p>
          </div>
        </div>

        {/* Action Icons Panel (envelope, pin, calendar, search, grid, more) */}
        <div className="flex items-center gap-3.5 text-slate-400">
          <button type="button" className="hover:text-slate-600 transition-colors" title="Email transcript">
            <Mail size={16} />
          </button>
          <button type="button" className="hover:text-slate-600 transition-colors" title="Pin candidate">
            <Pin size={16} />
          </button>
          <button type="button" className="hover:text-slate-600 transition-colors" title="Schedule interview">
            <Calendar size={16} />
          </button>
          <div className="w-px h-4 bg-slate-100 mx-1" />
          <button type="button" className="hover:text-slate-600 transition-colors" title="Search conversation">
            <Search size={16} />
          </button>
          <button type="button" className="hover:text-slate-600 transition-colors" title="View files">
            <LayoutGrid size={16} />
          </button>
          <button type="button" className="hover:text-slate-600 transition-colors" title="More options">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Subscription Tier Upsell Warning Banner */}
      {showUpsell && (
        <div className="bg-[#fafdfb] border-b border-emerald-100 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck size={16} />
            </div>
            <p className="text-[10px] text-emerald-800 font-semibold leading-normal">
              Professional Tier: Unlock priority support and unlimited direct messaging for your team.
            </p>
          </div>
          <a
            href="/settings/account"
            className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#006e2f] hover:text-[#005c26] transition-colors shrink-0"
          >
            Upgrade Now
            <ChevronLeft size={10} className="rotate-180" />
          </a>
        </div>
      )}

      {/* Message History Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col bg-white">
        
        {/* Date Separator */}
        <div className="relative flex items-center justify-center my-2 select-none">
          <div className="absolute w-full border-t border-slate-100" />
          <span className="relative px-3 bg-white text-[9px] font-bold text-slate-400 tracking-wider">
            {getFormatDateHeader()}
          </span>
        </div>

        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={message.senderId === currentUserId}
            />
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2">
            <p className="text-xs text-slate-400 font-semibold">No messages in this thread yet.</p>
            <p className="text-[10px] text-slate-400 font-medium max-w-xs leading-relaxed">
              Send a message to introduce yourself and start the conversation.
            </p>
          </div>
        )}
      </div>

      {/* Quick Replies Tray */}
      <div className="px-6 py-2.5 border-t border-slate-100/50 bg-white bg-opacity-70 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-slate-200 shrink-0">
        {quickReplies.map((reply, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSendMessage(reply)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-100 rounded-lg text-[10px] text-slate-500 font-bold transition-all shrink-0 cursor-pointer"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
}
