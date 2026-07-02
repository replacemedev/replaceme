"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { AdminFilterPills } from "@/components/admin/shared/AdminFilterPills";
import {
  AdminDataTable,
  ADMIN_TABLE_HEAD,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TH,
  AdminMobileCard,
} from "@/components/admin/shared/AdminDataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import {
  listEmailEvents,
  listEmailMessages,
  type AdminEmailMessageRow,
  type AdminEmailEventRow,
} from "@/actions/admin/email-management";
import { createAndSendBroadcast } from "@/actions/admin/email-broadcasts";
import { AdminSlideover } from "@/components/admin/shared/AdminSlideover";

const STATUS_FILTERS = [
  "all",
  "queued",
  "scheduled",
  "sent",
  "delivered",
  "opened",
  "clicked",
  "delayed",
  "bounced",
  "complained",
  "suppressed",
  "failed",
] as const;

const SEGMENT_OPTIONS = [
  { key: "role_employer", label: "Employers" },
  { key: "role_worker", label: "Workers" },
  { key: "role_admin", label: "Admins (requires segment)" },
  { key: "tier_discovery", label: "Discovery (requires segment)" },
  { key: "tier_starter", label: "Starter (requires segment)" },
  { key: "tier_growth", label: "Growth (requires segment)" },
  { key: "tier_scale", label: "Scale (requires segment)" },
] as const;

function formatWhen(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function AdminEmailManagementClient({
  initial,
  isSuperAdmin,
}: {
  initial: AdminEmailMessageRow[];
  isSuperAdmin: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] =
    useState<(typeof STATUS_FILTERS)[number]>("all");
  const [rows, setRows] = useState(initial);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [events, setEvents] = useState<AdminEmailEventRow[]>([]);

  const [segmentKey, setSegmentKey] = useState<(typeof SEGMENT_OPTIONS)[number]["key"]>(
    "role_employer"
  );
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of STATUS_FILTERS) map.set(f, 0);
    map.set("all", rows.length);
    for (const r of rows) {
      map.set(r.status, (map.get(r.status) ?? 0) + 1);
    }
    return Object.fromEntries(map.entries());
  }, [rows]);

  const refresh = () => {
    startTransition(async () => {
      const next = await listEmailMessages({
        limit: 50,
        status: status === "all" ? undefined : (status as any),
      });
      setRows(next.messages);
    });
  };

  const openRow = (id: string) => {
    setSelectedId(id);
    setEvents([]);
    startTransition(async () => {
      const next = await listEmailEvents(id);
      setEvents(next.events);
    });
  };

  const sendBroadcast = () => {
    startTransition(async () => {
      const result = await createAndSendBroadcast({
        segmentKey: segmentKey as any,
        subject,
        html,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Broadcast sent");
      setSubject("");
      setHtml("");
      refresh();
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900">Broadcast composer</p>
            <p className="text-sm text-slate-500">
              Send a broadcast to a Resend Segment (role/tier). Super admin only.
            </p>
          </div>

          {!isSuperAdmin ? (
            <p className="text-sm font-semibold text-slate-400">
              Super admin required
            </p>
          ) : (
            <button
              type="button"
              onClick={sendBroadcast}
              disabled={pending || subject.trim().length < 3 || html.trim().length < 30}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Send broadcast
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-12">
          <label className="lg:col-span-4">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Segment
            </span>
            <select
              value={segmentKey}
              onChange={(e) => setSegmentKey(e.target.value as any)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800"
              disabled={!isSuperAdmin || pending}
            >
              {SEGMENT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="lg:col-span-8">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Subject
            </span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800"
              placeholder="e.g. Platform update"
              disabled={!isSuperAdmin || pending}
            />
          </label>

          <label className="lg:col-span-12">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
              HTML body
            </span>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="mt-1 min-h-[140px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800"
              placeholder="<p>Write your update...</p>"
              disabled={!isSuperAdmin || pending}
            />
            <p className="mt-2 text-xs text-slate-400">
              Tip: include an unsubscribe link placeholder when you switch to Broadcast templates later.
            </p>
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <AdminFilterPills
            options={STATUS_FILTERS.map((s) => (s === "all" ? "All" : s))}
            value={status === "all" ? "All" : status}
            onChange={(v) => setStatus(v === "All" ? "all" : (v as any))}
            counts={Object.fromEntries(
              STATUS_FILTERS.map((s) => [
                s === "all" ? "All" : s,
                (counts as any)[s] ?? 0,
              ])
            )}
          />

          <button
            type="button"
            onClick={refresh}
            disabled={pending}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        <AdminDataTable
          mobileCards={
            rows.map((row) => (
              <AdminMobileCard
                key={row.id}
                actions={
                  <button
                    type="button"
                    onClick={() => openRow(row.id)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    View events
                  </button>
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 line-clamp-2">
                      {row.subject ?? "—"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {row.kind} · {row.to_email ?? "Broadcast"}
                    </p>
                  </div>
                  <StatusBadge status={row.status} />
                </div>
                <p className="text-xs text-slate-400">
                  {formatWhen(row.last_event_at ?? row.created_at)}
                </p>
              </AdminMobileCard>
            ))
          }
        >
          <table className="w-full text-sm">
            <thead className={ADMIN_TABLE_HEAD}>
              <tr>
                <th className={ADMIN_TABLE_TH}>Subject</th>
                <th className={ADMIN_TABLE_TH}>Kind</th>
                <th className={ADMIN_TABLE_TH}>Recipient</th>
                <th className={ADMIN_TABLE_TH}>Status</th>
                <th className={ADMIN_TABLE_TH}>Last event</th>
                <th className={`${ADMIN_TABLE_TH} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((row) => (
                <tr key={row.id} className={ADMIN_TABLE_ROW}>
                  <td className={ADMIN_TABLE_TD}>
                    <p className="font-semibold text-slate-900 line-clamp-2">
                      {row.subject ?? "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {row.provider_message_id ?? row.provider_broadcast_id ?? "—"}
                    </p>
                  </td>
                  <td className={ADMIN_TABLE_TD}>
                    <span className="text-xs font-semibold text-slate-700">
                      {row.kind}
                    </span>
                  </td>
                  <td className={ADMIN_TABLE_TD}>
                    <span className="text-xs text-slate-600">
                      {row.to_email ?? "Broadcast"}
                    </span>
                  </td>
                  <td className={ADMIN_TABLE_TD}>
                    <StatusBadge status={row.status} />
                  </td>
                  <td className={ADMIN_TABLE_TD}>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {formatWhen(row.last_event_at ?? row.created_at)}
                    </span>
                  </td>
                  <td className={`${ADMIN_TABLE_TD} text-right`}>
                    <button
                      type="button"
                      onClick={() => openRow(row.id)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      View events
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminDataTable>
      </section>

      <AdminSlideover
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
        title="Email events"
        description="Webhook-delivered delivery outcomes from Resend."
      >
        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-sm text-slate-500">No events recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {events.map((e) => (
                <li
                  key={e.id}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {e.event_type}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatWhen(e.occurred_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </AdminSlideover>
    </div>
  );
}

