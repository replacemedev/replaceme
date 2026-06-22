"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Pin, MessageSquare, ChevronDown } from "lucide-react";
import { Conversation } from "@/types/employer/messages";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectThread: (id: string) => void;
  selectedRole: string;
  onSelectRole: (role: string) => void;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelectThread,
  selectedRole,
  onSelectRole,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "pinned">("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Extract all unique candidate roles dynamically from conversations
  const availableRoles = Array.from(
    new Set(conversations.map((c) => c.candidateRole).filter(Boolean))
  ) as string[];

  const roleOptions = ["All Roles", ...availableRoles];

  // Filter conversations based on search query, role filter, and tab filters
  const filteredConversations = conversations.filter((thread) => {
    // 1. Search Query Filter
    const nameMatch = thread.participantNames.some((name) =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const roleMatch = thread.candidateRole?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const snippetMatch = thread.lastMessageSnippet?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesSearch = nameMatch || roleMatch || snippetMatch;
    if (!matchesSearch) return false;

    // 2. Role Filter Dropdown
    if (selectedRole && selectedRole !== "All Roles") {
      if (thread.candidateRole?.toLowerCase() !== selectedRole.toLowerCase()) {
        return false;
      }
    }

    // 3. Tab Filter
    if (activeTab === "unread") return thread.isUnread;
    if (activeTab === "pinned") return !!thread.pinned;
    return true;
  });

  return (
    <div className="w-full md:w-80 border-r border-slate-100 flex flex-col h-full bg-white bg-opacity-95 shrink-0">
      {/* Top Search Input Box */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:bg-white transition-all font-body-base"
          />
        </div>

        {/* Role Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full h-10 px-4 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-700 transition-all focus:outline-none"
          >
            <span>{selectedRole || "All Roles"}</span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-11 left-0 w-full bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-50 animate-fadeIn max-h-56 overflow-y-auto">
              {roleOptions.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    onSelectRole(role);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                    (selectedRole || "All Roles") === role
                      ? "bg-emerald-50/50 text-[#006e2f] font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 pb-3 border-b border-slate-50 flex gap-2">
        {(["all", "unread", "pinned"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 h-8 rounded-lg text-xs font-bold capitalize transition-all ${
              activeTab === tab
                ? "bg-[#fafdfb] border border-emerald-100 text-[#006e2f] shadow-sm"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {conversations.length === 0 ? (
          /* "No conversations yet" Empty State */
          <div className="p-8 text-center space-y-2">
            <MessageSquare className="mx-auto h-8 w-8 text-slate-300 animate-pulse" />
            <p className="text-xs text-slate-400 font-semibold">No conversations yet</p>
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((thread) => {
            const isActive = thread.id === activeId;
            
            // Format name details
            const displayName = thread.participantNames.join(", ") || "Candidate";
            const initials = displayName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase();

            // Format timestamp for last update
            let formattedTime = "";
            if (thread.updatedAt) {
              try {
                const date = new Date(thread.updatedAt);
                const now = new Date();
                if (date.toDateString() === now.toDateString()) {
                  formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                } else {
                  formattedTime = date.toLocaleDateString([], { month: "short", day: "numeric" });
                }
              } catch (e) {
                formattedTime = thread.updatedAt;
              }
            }

            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => onSelectThread(thread.id)}
                className={`w-full text-left p-4 flex gap-3 transition-colors ${
                  isActive
                    ? "bg-emerald-50/20 border-l-4 border-[#22c55e] pl-3"
                    : "hover:bg-slate-50/40 border-l-4 border-transparent"
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                  {initials}
                </div>

                {/* Details snippet */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 truncate">{displayName}</h3>
                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                      {formattedTime}
                    </span>
                  </div>

                  <p className="text-[10px] font-bold text-[#22c55e] truncate">
                    {thread.candidateRole || "Candidate"}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-[11px] truncate flex-1 ${
                        thread.isUnread ? "text-slate-900 font-bold" : "text-slate-400 font-medium"
                      }`}
                    >
                      {thread.lastMessageSnippet || "No messages yet"}
                    </p>

                    {/* Unread & Pin indicators */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {thread.pinned && <Pin size={10} className="text-slate-400 rotate-45" />}
                      {thread.isUnread && (
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          /* No filter match state */
          <div className="p-8 text-center space-y-2">
            <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />
            <p className="text-xs text-slate-400 font-semibold">No messages match search</p>
          </div>
        )}
      </div>
    </div>
  );
}
