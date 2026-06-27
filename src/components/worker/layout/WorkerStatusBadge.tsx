interface WorkerStatusBadgeProps {
  label: string;
  tone?: "default" | "success" | "warning" | "info";
}

const TONE_STYLES = {
  default: "border-slate-200 bg-slate-50 text-slate-700",
  success: "border-[#006e2f]/20 bg-[#ebfdf2] text-[#006e2f]",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-blue-200 bg-blue-50 text-blue-700",
} as const;

export function WorkerStatusBadge({
  label,
  tone = "default",
}: WorkerStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TONE_STYLES[tone]}`}
    >
      {label}
    </span>
  );
}
