const STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  suspended: "bg-red-50 text-red-700 ring-red-600/20",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  rejected: "bg-red-50 text-red-700 ring-red-600/20",
  "Pending Review": "bg-amber-50 text-amber-700 ring-amber-600/20",
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Closed: "bg-slate-100 text-slate-600 ring-slate-500/20",
  Draft: "bg-slate-100 text-slate-600 ring-slate-500/20",
  inactive: "bg-slate-100 text-slate-600 ring-slate-500/20",
  trialing: "bg-blue-50 text-blue-700 ring-blue-600/20",
  past_due: "bg-amber-50 text-amber-700 ring-amber-600/20",
  canceled: "bg-slate-100 text-slate-600 ring-slate-500/20",
  unpaid: "bg-red-50 text-red-700 ring-red-600/20",
  documents_submitted: "bg-blue-50 text-blue-700 ring-blue-600/20",
  under_review: "bg-amber-50 text-amber-700 ring-amber-600/20",
  unverified: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STYLES[status] ?? "bg-slate-100 text-slate-600 ring-slate-500/20";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${style}`}
    >
      {formatLabel(status)}
    </span>
  );
}
