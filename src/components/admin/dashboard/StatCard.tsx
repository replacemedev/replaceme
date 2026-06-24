import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accentColor?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accentColor = "bg-emerald-50 text-emerald-600",
}: StatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1.5 tabular-nums">
            {value.toLocaleString()}
          </p>
          {trend && (
            <p className="text-xs text-slate-500 mt-1.5">
              <span
                className={
                  trend.value >= 0 ? "text-emerald-600" : "text-red-500"
                }
              >
                {trend.value >= 0 ? "+" : ""}
                {trend.value}%
              </span>{" "}
              {trend.label}
            </p>
          )}
        </div>
        <span
          className={`flex items-center justify-center w-10 h-10 rounded-xl ${accentColor}`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </article>
  );
}
