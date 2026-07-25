import type { TimeSeriesPoint } from "@/types/admin.types";
import { TrendingUp } from "lucide-react";

interface MetricsChartProps {
  title: string;
  data: TimeSeriesPoint[];
  accentClass?: string;
}

export function MetricsChart({
  title,
  data,
  accentClass = "from-[#22c55e] to-[#006e2f]",
}: MetricsChartProps) {
  const counts = data.map((point) => Number(point.count) || 0);
  const maxCount = Math.max(...counts, 1);
  const total = counts.reduce((sum, count) => sum + count, 0);

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Last 30 days</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-[#ebfdf2] px-2.5 py-1 text-xs font-bold text-[#006e2f]">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden />
          {total.toLocaleString()} total
        </div>
      </div>
      {data.length === 0 ? (
        <div className="h-[220px] w-full flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <p className="text-xs text-slate-400">No activity in the last 30 days</p>
        </div>
      ) : (
        // ponytail: explicit height + flex-1 bar track so % heights resolve (Safari/WebKit safe)
        <div className="h-[220px] w-full min-h-0 min-w-0 flex items-stretch gap-1 px-1 pt-2 border-t border-slate-100">
          {data.map((point, index) => {
            const count = counts[index] ?? 0;
            const heightPct = Math.max((count / maxCount) * 100, 6);
            const label = new Date(point.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });
            return (
              <div
                key={point.date}
                className="flex-1 min-w-0 min-h-0 h-full flex flex-col items-center gap-1.5 group"
                title={`${label}: ${count}`}
              >
                <span className="text-[10px] font-semibold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 h-3.5 leading-none">
                  {count}
                </span>
                <div className="w-full flex-1 min-h-0 flex items-end">
                  <div
                    className={`w-full rounded-t-lg bg-gradient-to-t ${accentClass} opacity-90 group-hover:opacity-100 transition-opacity`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-400 truncate w-full text-center shrink-0">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
