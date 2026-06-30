"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ImageIcon, Paperclip } from "lucide-react";
import { toast } from "sonner";
import {
  getAdminReportById,
  getAdminReports,
  updateReportStatus,
  type AdminReportDeepDive,
  type AdminReportRow,
} from "@/actions/reports";
import { REPORT_STATUSES } from "@/lib/reporting/constants";
import { AdminFilterPills } from "@/components/admin/shared/AdminFilterPills";
import { AdminSlideover } from "@/components/admin/shared/AdminSlideover";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

const STATUS_FILTERS = ["open", "in_progress", "resolved"] as const;
const ROLE_FILTERS = ["all", "worker", "employer"] as const;

function prettyStatus(s: string) {
  return s === "in_progress" ? "In progress" : s.charAt(0).toUpperCase() + s.slice(1);
}

export function AdminReportsClient({
  initial,
}: {
  initial: { items: AdminReportRow[]; total: number };
}) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("open");
  const [role, setRole] = useState<(typeof ROLE_FILTERS)[number]>("all");
  const [q, setQ] = useState("");
  const [data, setData] = useState(initial);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminReportDeepDive | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of STATUS_FILTERS) counts[s] = 0;
    for (const r of data.items) {
      if (counts[r.status] != null) counts[r.status] += 1;
    }
    return counts;
  }, [data.items]);

  const refresh = () => {
    startTransition(async () => {
      const next = await getAdminReports({
        status,
        reporterRole: role === "all" ? undefined : role,
        q: q.trim() || undefined,
        limit: 25,
        offset: 0,
      });
      if (!next) {
        toast.error("Failed to load reports");
        return;
      }
      setData(next);
    });
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, role]);

  useEffect(() => {
    if (!selectedId) return;
    startTransition(async () => {
      const full = await getAdminReportById(selectedId);
      if (!full) {
        toast.error("Failed to load report");
        return;
      }
      setSelected(full);
      setNotesDraft(full.adminNotes ?? "");
    });
  }, [selectedId, startTransition]);

  const openPanel = (id: string) => {
    setSelectedId(id);
    setSelected(null);
  };

  const saveStatus = (nextStatus: (typeof REPORT_STATUSES)[number]) => {
    if (!selected) return;
    startTransition(async () => {
      const result = await updateReportStatus({
        reportId: selected.id,
        status: nextStatus,
        adminNotes: notesDraft,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Report updated");
      await refresh();
      const full = await getAdminReportById(selected.id);
      setSelected(full);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <AdminFilterPills
            options={STATUS_FILTERS.map(prettyStatus)}
            value={prettyStatus(status)}
            onChange={(v) =>
              setStatus(
                v === "In progress" ? "in_progress" : (v.toLowerCase() as any)
              )
            }
            counts={{
              Open: statusCounts.open ?? 0,
              "In progress": statusCounts.in_progress ?? 0,
              Resolved: statusCounts.resolved ?? 0,
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            {ROLE_FILTERS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  role === r
                    ? "border-[#006e2f]/30 bg-[#ebfdf2] text-[#006e2f]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {r === "all" ? "All roles" : r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, URL, description…"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 sm:w-[320px]"
          />
          <button
            type="button"
            onClick={refresh}
            disabled={pending}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3">Report</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Attachment</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.items.map((r) => (
              <tr
                key={r.id}
                className="cursor-pointer hover:bg-slate-50/60"
                onClick={() => openPanel(r.id)}
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">
                    {r.title || r.category.replace(/_/g, " ")}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">
                    {r.reportedUrl ?? "—"}
                  </p>
                </td>
                <td className="px-4 py-3 text-slate-600">{r.reporterRole}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={prettyStatus(r.status)} />
                </td>
                <td className="px-4 py-3">
                  {r.hasEvidence ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPanel(r.id);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#006e2f]/20 bg-[#ebfdf2] px-2.5 py-1 text-xs font-bold text-[#006e2f] transition-colors hover:bg-[#d8f9e6]"
                    >
                      <Paperclip className="h-3.5 w-3.5" aria-hidden />
                      View image
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminSlideover
        open={Boolean(selectedId)}
        onClose={() => {
          setSelectedId(null);
          setSelected(null);
        }}
        title={selected?.title || "Report details"}
        description={selected ? `${selected.category.replace(/_/g, " ")} • ${prettyStatus(selected.status)}` : "Loading…"}
      >
        {!selected ? (
          <p className="text-sm font-medium text-slate-500">Loading report…</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Reporter
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {selected.reporterRole}
                </p>
                <p className="mt-1 text-xs font-mono text-slate-500">
                  {selected.reporterId}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Reported URL
                </p>
                {selected.reportedUrl ? (
                  <a
                    href={selected.reportedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block break-all text-sm font-semibold text-[#006e2f] hover:underline"
                  >
                    {selected.reportedUrl}
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-medium text-slate-600">—</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Description (Markdown)
              </p>
              <pre className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800">
                {selected.descriptionMarkdown}
              </pre>
            </div>

            {selected.evidenceStoragePath ? (
              <div className="space-y-3 rounded-2xl border border-[#006e2f]/15 bg-[#fafdfb] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Screenshot evidence
                  </p>
                  {selected.evidenceSignedUrl ? (
                    <a
                      href={selected.evidenceSignedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#006e2f] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#005c26]"
                    >
                      <ImageIcon className="h-4 w-4" aria-hidden />
                      View attachment
                    </a>
                  ) : null}
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  {selected.evidenceSignedUrl ? (
                    <div className="relative aspect-video w-full max-h-80">
                      <img
                        src={selected.evidenceSignedUrl}
                        alt="Report screenshot evidence"
                        className="h-full w-full max-h-80 object-contain p-2"
                      />
                    </div>
                  ) : (
                    <p className="px-4 py-6 text-center text-sm font-medium text-amber-700">
                      Attachment is on file but the preview could not be loaded.
                      Try reopening this report.
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-4 py-2">
                    <p className="text-xs font-medium text-slate-500">
                      {selected.evidenceFileSizeBytes
                        ? `${(selected.evidenceFileSizeBytes / 1024).toFixed(0)} KB`
                        : "Attached file"}
                      {selected.evidenceMimeType
                        ? ` • ${selected.evidenceMimeType}`
                        : ""}
                    </p>
                    {selected.evidenceSignedUrl ? (
                      <a
                        href={selected.evidenceSignedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-[#006e2f] hover:underline"
                      >
                        Open full size
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Admin notes
              </p>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => saveStatus("open")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Mark open
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => saveStatus("in_progress")}
                className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50"
              >
                Mark in progress
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => saveStatus("resolved")}
                className="rounded-xl bg-[#006e2f] px-4 py-2 text-sm font-bold text-white hover:bg-[#005c26] disabled:opacity-50"
              >
                Resolve
              </button>
            </div>
          </div>
        )}
      </AdminSlideover>
    </div>
  );
}

