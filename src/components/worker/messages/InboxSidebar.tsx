"use client";

import React from "react";
import { Search } from "lucide-react";
import { ChatThread } from "@/types/messaging";
import { InboxThreadItem } from "./InboxThreadItem";

interface InboxSidebarProps {
  threads: ChatThread[];
  selectedThreadId: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: "all" | "unread" | "pinned";
  setActiveTab: (tab: "all" | "unread" | "pinned") => void;
  onSelectThread: (threadId: string) => void;
}

export function InboxSidebar({
  threads,
  selectedThreadId,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  onSelectThread,
}: InboxSidebarProps) {
  // Filter threads based on tab and search query
  const filteredThreads = threads.filter((t) => {
    // Search filter
    const compName = t.company_profiles?.company_name || "";
    const jobTitle = t.jobs?.title || "";
    const lastMsgContent = t.last_message?.content || "";
    
    const matchesSearch =
      compName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMsgContent.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === "unread") {
      return (t.unread_count || 0) > 0;
    }
    if (activeTab === "pinned") {
      return t.is_pinned;
    }
    return true;
  });

  return (
    <aside className="w-full md:w-80 shrink-0 border-r border-slate-200 bg-white flex flex-col h-full">
      {/* Header Info */}
      <div className="p-4 border-b border-slate-100 shrink-0">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-3">Inbox</h2>
        
        {/* Search Input Container */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#006e2f] focus:border-[#006e2f] focus:bg-white transition-all"
          />
        </div>

        {/* Tab Selection Row */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
          {(["all", "unread", "pinned"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Thread List */}
      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-100">
        {filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-48">
            <p className="text-sm font-medium text-slate-400">No conversations found</p>
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <InboxThreadItem
              key={thread.id}
              thread={thread}
              isActive={selectedThreadId === thread.id}
              onClick={() => onSelectThread(thread.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
