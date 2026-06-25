"use client";

import { Search } from "lucide-react";
import {
  ALL_JOB_ROLES,
  JobRoleFilterValue,
  MessagingJobRole,
  MessagingThread,
} from "@/types/messaging";
import { InboxThreadItem } from "./InboxThreadItem";

interface InboxSidebarProps {
  threads: MessagingThread[];
  selectedThreadId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: "all" | "unread" | "pinned";
  onTabChange: (tab: "all" | "unread" | "pinned") => void;
  availableJobRoles: MessagingJobRole[];
  selectedJobRole: JobRoleFilterValue;
  onJobRoleChange: (jobRoleId: JobRoleFilterValue) => void;
  onSelectThread: (threadId: string) => void;
}

export function InboxSidebar({
  threads,
  selectedThreadId,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  availableJobRoles,
  selectedJobRole,
  onJobRoleChange,
  onSelectThread,
}: InboxSidebarProps) {
  const filtered = threads.filter((t) => {
    if (selectedJobRole !== ALL_JOB_ROLES && t.job_id !== selectedJobRole) {
      return false;
    }

    const q = searchQuery.toLowerCase();
    const matches =
      t.oppositeParty.name.toLowerCase().includes(q) ||
      (t.jobTitle?.toLowerCase().includes(q) ?? false) ||
      (t.last_message?.content.toLowerCase().includes(q) ?? false);
    if (!matches) return false;
    if (activeTab === "unread") return t.unread_count > 0;
    if (activeTab === "pinned") return t.is_pinned;
    return true;
  });

  return (
    <aside className="w-[320px] shrink-0 border-r border-slate-200 bg-white flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 shrink-0">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
          Inbox
        </h2>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#006e2f] focus:border-[#006e2f]"
          />
        </div>

        <label
          htmlFor="job-role-filter"
          className="block text-xs font-semibold text-slate-600 mb-1.5"
        >
          Filter by Job Role
        </label>
        <select
          id="job-role-filter"
          value={selectedJobRole}
          onChange={(e) => onJobRoleChange(e.target.value as JobRoleFilterValue)}
          className="w-full mb-3 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#006e2f] focus:border-[#006e2f] cursor-pointer"
        >
          <option value={ALL_JOB_ROLES}>All Roles</option>
          {availableJobRoles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.title}
            </option>
          ))}
        </select>

        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
          {(["all", "unread", "pinned"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md capitalize cursor-pointer ${
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

      <div className="flex-1 overflow-y-auto min-h-0">
        {filtered.length === 0 ? (
          <p className="flex items-center justify-center h-full text-sm font-medium text-slate-400 px-4 text-center">
            No threads found
          </p>
        ) : (
          filtered.map((thread) => (
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
