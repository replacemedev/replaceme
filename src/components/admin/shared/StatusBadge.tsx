const STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  suspended: "bg-red-50 text-red-700 ring-red-600/20",
  deleted: "bg-red-50 text-red-800 ring-red-600/25",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  resubmission_required: "bg-amber-50 text-amber-700 ring-amber-600/20",
  rejected: "bg-amber-50 text-amber-800 ring-amber-600/25",
  REJECTED: "bg-amber-50 text-amber-800 ring-amber-600/25",
  Rejected: "bg-amber-50 text-amber-800 ring-amber-600/25",
  Deleted: "bg-red-50 text-red-800 ring-red-600/25",
  "Pending Review": "bg-amber-50 text-amber-700 ring-amber-600/20",
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Closed: "bg-slate-100 text-slate-600 ring-slate-500/20",
  Draft: "bg-slate-100 text-slate-600 ring-slate-500/20",
  inactive: "bg-slate-100 text-slate-600 ring-slate-500/20",
  trialing: "bg-blue-50 text-blue-700 ring-blue-600/20",
  past_due: "bg-amber-50 text-amber-700 ring-amber-600/20",
  incomplete: "bg-amber-50 text-amber-700 ring-amber-600/20",
  canceled: "bg-slate-100 text-slate-600 ring-slate-500/20",
  unpaid: "bg-red-50 text-red-700 ring-red-600/20",
  lost: "bg-red-50 text-red-700 ring-red-600/20",
  under_review: "bg-amber-50 text-amber-700 ring-amber-600/20",
  UNDER_REVIEW: "bg-blue-50 text-blue-700 ring-blue-600/20",
  documents_submitted: "bg-blue-50 text-blue-700 ring-blue-600/20",
  unverified: "bg-slate-100 text-slate-600 ring-slate-500/20",
  verified: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
  HIRED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  WITHDRAWN: "bg-slate-100 text-slate-600 ring-slate-500/20",
  flagged: "bg-orange-50 text-orange-700 ring-orange-600/20",
  clear: "bg-slate-50 text-slate-600 ring-slate-400/20",
  reviewed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  REVIEWED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  dismissed: "bg-slate-100 text-slate-600 ring-slate-500/20",
  DISMISSED: "bg-slate-100 text-slate-600 ring-slate-500/20",
  open: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Open: "bg-amber-50 text-amber-700 ring-amber-600/20",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-600/20",
  "In progress": "bg-blue-50 text-blue-700 ring-blue-600/20",
  investigating: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Investigating: "bg-blue-50 text-blue-700 ring-blue-600/20",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  awaiting_evidence: "bg-amber-50 text-amber-800 ring-amber-600/25",
  "Awaiting Evidence": "bg-amber-50 text-amber-800 ring-amber-600/25",
  in_mediation: "bg-violet-50 text-violet-800 ring-violet-600/25",
  "In Mediation": "bg-violet-50 text-violet-800 ring-violet-600/25",
  arbitration_noted: "bg-red-50 text-red-800 ring-red-600/25",
  "Arbitration Noted": "bg-red-50 text-red-800 ring-red-600/25",
  Dismissed: "bg-slate-100 text-slate-600 ring-slate-500/20",
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
