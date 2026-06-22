import React from "react";
import Link from "next/link";
import { MessageSquare, ChevronRight } from "lucide-react";
import { Message } from "@/types/employer/dashboard";

interface RecentMessagesProps {
  messages: Message[];
}

export function RecentMessages({ messages }: RecentMessagesProps) {
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800">Recent Messages</h2>
        <Link 
          href="/messages" 
          className="text-sm font-bold text-[#22c55e] hover:underline flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-[#22c55e] rounded"
        >
          Inbox <ChevronRight size={16} />
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {messages.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {messages.map((msg) => (
              <Link
                key={msg.id}
                href={`/messages/${msg.id}`}
                className={`p-4 flex gap-4 items-start hover:bg-slate-50 transition-colors w-full text-left focus-visible:outline-2 focus-visible:outline-[#22c55e] ${
                  msg.isUnread ? "bg-green-50/20" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                  {msg.senderInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className={`text-sm ${msg.isUnread ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                      {msg.senderName}
                    </h4>
                    <span className="text-xs text-slate-500">{msg.timestamp}</span>
                  </div>
                  <p className={`text-sm truncate ${msg.isUnread ? "text-slate-800 font-medium" : "text-slate-500"}`}>
                    {msg.content}
                  </p>
                </div>
                {msg.isUnread && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] self-center shrink-0" />
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-3">
              <MessageSquare className="text-slate-400" size={18} />
            </div>
            <h4 className="text-sm font-bold text-slate-900">No messages yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              When you contact candidates or receive applications, your chats will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
