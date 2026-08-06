interface ApprovalStatusBadgeProps {
  status: string;
  className?: string;
}

function normalizeStatus(status: string): string {
  const value = status.trim();
  if (/rejected/i.test(value)) return "rejected";
  if (/deleted/i.test(value)) return "deleted";
  if (/pending/i.test(value)) return "pending";
  if (/closed|inactive|deactivated/i.test(value)) return "closed";
  if (/active|live|open/i.test(value)) return "active";
  return value.toLowerCase();
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-[#ebfdf2] text-[#006e2f] border-[#006e2f]/25",
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  rejected: "bg-red-50 text-red-800 border-red-200",
  deleted: "bg-red-50 text-red-800 border-red-200",
  closed: "bg-slate-100 text-slate-700 border-slate-200",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Live",
  pending: "In review",
  rejected: "Rejected",
  deleted: "Deleted",
  closed: "Closed",
};

export function ApprovalStatusBadge({
  status,
  className = "",
}: ApprovalStatusBadgeProps) {
  const key = normalizeStatus(status);
  const style =
    STATUS_STYLES[key] ?? "bg-slate-100 text-slate-600 border-slate-200";
  const label =
    STATUS_LABELS[key] ??
    status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide select-none ${style} ${className}`}
    >
      {label}
    </span>
  );
}
