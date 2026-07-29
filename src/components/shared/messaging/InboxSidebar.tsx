"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Virtuoso } from "react-virtuoso";
import {
  ALL_JOB_ROLES,
  JobRoleFilterValue,
  MessagingJobRole,
  MessagingRole,
  MessagingThread,
  sortThreadsByRecentActivity,
} from "@/types/messaging";
import { InboxThreadItem } from "./InboxThreadItem";
import { EmptyState } from "@/components/shared/EmptyState";
import { Inbox, Search, Bookmark } from "lucide-react";

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
  role?: MessagingRole;
  mobileHidden?: boolean;
  hasMoreThreads?: boolean;
  isLoadingMoreThreads?: boolean;
  onLoadMoreThreads?: () => void;
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
  role = "worker",
  mobileHidden = false,
  hasMoreThreads = false,
  isLoadingMoreThreads = false,
  onLoadMoreThreads,
}: InboxSidebarProps) {
  const filtered = useMemo(
    () =>
      sortThreadsByRecentActivity(
        threads.filter((t) => {
          if (selectedJobRole !== ALL_JOB_ROLES && t.job_id !== selectedJobRole) {
            return false;
          }

          const q = searchQuery.toLowerCase();
          const matches =
            t.oppositeParty.name.toLowerCase().includes(q) ||
            (t.jobTitle?.toLowerCase().includes(q) ?? false) ||
            (t.last_message?.content.toLowerCase().includes(q) ?? false);
          if (!matches) return false;
          if (activeTab === "unread") return t.unread_count > 0 || t.marked_unread;
          if (activeTab === "pinned") return t.is_pinned;
          return true;
        })
      ),
    [threads, selectedJobRole, searchQuery, activeTab]
  );

  return (
    <aside
      className={`w-full lg:w-[320px] shrink-0 border-r border-slate-200 bg-white flex flex-col h-full min-h-0 ${
        mobileHidden ? "hidden lg:flex" : ""
      }`}
    >
      <div className="p-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {role === "employer" ? "Candidate Inbox" : "Inbox"}
          </h2>
          {role === "employer" ? (
            <Link
              href="/employer/pinned"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006e2f] hover:text-[#005321] hover:underline transition-colors"
            >
              <Bookmark size={13} />
              Talent Pool
            </Link>
          ) : null}
        </div>

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
          {availableJobRoles.map((jobRole) => (
            <option key={jobRole.id} value={jobRole.id}>
              {jobRole.title}
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

      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]"
      >
        {threads.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4">
            <EmptyState
              icon={<Inbox size={22} aria-hidden />}
              title={
                role === "employer"
                  ? "No conversations yet"
                  : "Your inbox is empty"
              }
              description={
                role === "employer"
                  ? "When you message candidates from applications, threads appear here."
                  : "When employers reach out about your applications, conversations show up here."
              }
              actionLabel={role === "employer" ? "View job posts" : undefined}
              actionHref={role === "employer" ? "/employer/jobs" : undefined}
            />
          </div>
        ) : filtered.length === 0 ? (
          <p className="flex items-center justify-center h-full text-sm font-medium text-slate-400 px-4 text-center">
            No threads match your filters
          </p>
        ) : (
          <Virtuoso
            style={{ height: "100%" }}
            className="h-full"
            data={filtered}
            endReached={() => {
              if (
                hasMoreThreads &&
                !isLoadingMoreThreads &&
                onLoadMoreThreads &&
                activeTab === "all" &&
                !searchQuery &&
                selectedJobRole === ALL_JOB_ROLES
              ) {
                onLoadMoreThreads();
              }
            }}
            increaseViewportBy={120}
            computeItemKey={(_, thread) => thread.id}
            itemContent={(_, thread) => (
              <InboxThreadItem
                thread={thread}
                isActive={selectedThreadId === thread.id}
                onClick={() => onSelectThread(thread.id)}
              />
            )}
            components={{
              Footer: () =>
                isLoadingMoreThreads ? (
                  <p className="py-3 text-center text-[11px] font-semibold text-slate-400">
                    Loading more…
                  </p>
                ) : (
                  <div className="h-2" />
                ),
            }}
          />
        )}
      </div>
    </aside>
  );
}
