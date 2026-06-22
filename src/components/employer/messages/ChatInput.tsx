"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, Lock } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [content, setContent] = useState("");
  const [isPending, setIsPending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height based on content length
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [content]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = content.trim();
    if (!trimmed || disabled || isPending) return;

    setIsPending(true);
    setContent("");
    
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await onSendMessage(trimmed);
    } catch (err) {
      // Restore content if error
      setContent(trimmed);
    } finally {
      setIsPending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-2">
      {/* Input container box (matching design mock layout) */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-2xl focus-within:ring-2 focus-within:ring-[#22c55e] focus-within:bg-white transition-all"
      >
        {/* Attachment Button inside box on left */}
        <button
          type="button"
          disabled={disabled || isPending}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors shrink-0"
          title="Add attachment"
        >
          <Paperclip size={16} />
        </button>

        {/* Text Area Input */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled || isPending}
          className="flex-1 bg-transparent border-none text-xs placeholder:text-slate-400 focus:outline-none resize-none max-h-[120px] font-body-base leading-relaxed text-slate-800 py-1.5"
        />

        {/* Emoji Button inside box on right */}
        <button
          type="button"
          disabled={disabled || isPending}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors shrink-0"
          title="Insert emoji"
        >
          <Smile size={16} />
        </button>

        {/* Send Button inside box on far right */}
        <button
          type="submit"
          disabled={!content.trim() || disabled || isPending}
          className="h-7 w-7 bg-[#006e2f] hover:bg-[#005c26] disabled:opacity-40 text-white rounded-lg flex items-center justify-center transition-all shrink-0 shadow-sm cursor-pointer"
          title="Send message"
        >
          <Send size={12} className={isPending ? "animate-pulse" : ""} />
        </button>
      </form>

      {/* Footer Text */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold px-1 select-none">
        <div className="flex items-center gap-1">
          <Lock size={10} className="text-slate-400" />
          <span>End-to-end encrypted</span>
        </div>
        <div>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}
