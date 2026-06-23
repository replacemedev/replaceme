"use client";

import React, { useState, useRef, useEffect } from "react";
import { Paperclip, Smile, Send, Lock } from "lucide-react";

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
      setMessage(""); // Clear input early for responsive UI
      await onSendMessage(textToSend);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
      // Keep focus on input
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
    <div className="shrink-0 p-4 border-t border-slate-200 bg-white">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* Input Bar Container */}
        <div className="relative flex items-center bg-[#f8fafd] border border-slate-200 rounded-xl px-4 py-2.5 transition-all focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/20">
          
          {/* Attachment Icon */}
          <button
            type="button"
            disabled={disabled}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md cursor-pointer disabled:opacity-50"
            aria-label="Attach files"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-0 outline-hidden focus:ring-0 text-sm text-slate-800 placeholder-slate-400 px-3 py-1"
          />

          {/* Emoji button */}
          <button
            type="button"
            disabled={disabled}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md mr-2 cursor-pointer disabled:opacity-50"
            aria-label="Add emoji"
          >
            <Smile className="h-5 w-5" />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={disabled || isSending || !message.trim()}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#006e2f] hover:bg-[#005c26] active:bg-[#00421a] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
            aria-label="Send message"
          >
            <Send className="h-4.5 w-4.5" />
          </button>

        </div>

        {/* Footer info row */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium select-none">
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
