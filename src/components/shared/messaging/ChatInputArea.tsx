"use client";

import React, { useState, useRef } from "react";
import { Send, Lock } from "lucide-react";

interface ChatInputAreaProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInputArea({ onSendMessage, disabled }: ChatInputAreaProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending || disabled) return;

    try {
      setIsSending(true);
      const textToSend = message;
      setMessage("");
      await onSendMessage(textToSend);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white p-4 sm:p-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="relative flex items-center rounded-lg border border-slate-200 bg-[#f8fafd] px-4 py-3 transition-all focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/20">
          <input
            type="text"
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
            placeholder="Type a message..."
            className="flex-1 border-0 bg-transparent px-0 py-1 text-sm text-slate-800 outline-hidden placeholder:text-slate-400 focus:ring-0"
          />

          <button
            type="submit"
            disabled={disabled || isSending || !message.trim()}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md bg-[#006e2f] text-white transition-colors hover:bg-[#005c26] active:bg-[#00421a] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <div className="flex select-none items-center justify-between px-1 text-[11px] font-medium text-slate-400">
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>End-to-end encrypted</span>
          </div>
          <span className="hidden sm:inline">Press Enter to send</span>
        </div>
      </form>
    </div>
  );
}
