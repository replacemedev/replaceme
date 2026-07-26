import Link from "next/link";
import type { AdminAuditLogRow } from "@/types/admin.types";

function formatAction(action: string): string {
  return action.replace(/^auth\./, "").replace(/_/g, " ");
}

export function AdminSecurityEventsCard({
  events,
  canViewFullAudit,
}: {
  events: AdminAuditLogRow[];
  canViewFullAudit: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col gap-2 border-b border-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Recent security actions
          </h2>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Suspensions, access changes, MFA, and session revokes.
          </p>
        </div>
        {canViewFullAudit ? (
          <Link
            href="/admin/audit-log"
            className="text-sm font-semibold text-[#006e2f] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
          >
            View full audit log
          </Link>
        ) : null}
      </div>

      <div className="p-5 sm:p-6">
        {events.length === 0 ? (
          <p className="text-sm text-slate-400">No security events recorded.</p>
        ) : (
          <ul className="space-y-0">
            {events.map((log) => (
              <li
                key={log.id}
                className="flex flex-col gap-1 border-b border-slate-50 py-3 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium capitalize text-slate-700">
                    {formatAction(log.action_type)}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {log.actor_display_name || log.actor_email || "System"}
                    {log.ip_address ? ` · ${log.ip_address}` : ""}
                  </p>
                </div>
                <time
                  className="shrink-0 text-xs text-slate-400"
                  dateTime={log.created_at}
                >
                  {new Date(log.created_at).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
