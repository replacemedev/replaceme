import { Activity } from "lucide-react";

interface AuditEntry {
  id: string;
  action_type: string;
  target_type: string | null;
  target_id: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

interface RecentActionsProps {
  actions: AuditEntry[];
}

function formatActionLabel(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function RecentActions({ actions }: RecentActionsProps) {
  if (actions.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <h2 className="text-sm font-bold text-slate-900 mb-4">
          Recent Admin Actions
        </h2>
        <p className="text-sm text-slate-400 text-center py-6">
          No recorded actions yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <h2 className="text-sm font-bold text-slate-900 mb-4">
        Recent Admin Actions
      </h2>
      <ul className="space-y-3">
        {actions.map((entry) => (
          <li
            key={entry.id}
            className="flex items-start gap-3 text-sm border-b border-slate-50 pb-3 last:border-0 last:pb-0"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-500 shrink-0 mt-0.5">
              <Activity className="h-3.5 w-3.5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-slate-700 font-medium text-xs">
                {formatActionLabel(entry.action_type)}
              </p>
              {entry.target_type && (
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {entry.target_type}
                  {entry.target_id ? `: ${entry.target_id}` : ""}
                </p>
              )}
            </div>
            <time className="text-[10px] text-slate-400 whitespace-nowrap mt-1">
              {new Date(entry.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </li>
        ))}
      </ul>
    </section>
  );
}
