"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { TablePagination } from "@/components/shared/TablePagination";
import type { AdminChatThreadRow } from "@/types/admin.types";

interface ModerationClientProps {
  threads: AdminChatThreadRow[];
}

export function ModerationClient({ threads }: ModerationClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  if (threads.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-5 w-5" aria-hidden />}
        title="No messaging threads"
        description="Worker–employer chat threads will appear here for moderation oversight."
      />
    );
  }

  const totalItems = threads.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const activePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedThreads = threads.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <AdminSectionLabel>Messaging threads</AdminSectionLabel>
        <span className="rounded-full bg-[#ebfdf2] px-2.5 py-1 text-[11px] font-bold text-[#006e2f]">
          {threads.length} threads
        </span>
      </div>
      <div className="space-y-4">
        <div className="overflow-x-auto w-full max-w-full rounded-lg shadow-sm border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-3">Worker</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Job context</th>
                <th className="px-4 py-3">Messages</th>
                <th className="px-4 py-3">Last activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedThreads.map((thread) => (
                <tr key={thread.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {thread.worker_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {thread.company_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{thread.job_title ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {thread.message_count}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {thread.last_message_at
                      ? new Date(thread.last_message_at).toLocaleString()
                      : new Date(thread.updated_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination
          currentPage={activePage}
          totalItems={totalItems}
          pageSize={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </section>
  );
}
