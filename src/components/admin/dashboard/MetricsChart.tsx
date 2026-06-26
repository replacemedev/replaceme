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
  const maxCount = Math.max(...data.map((point) => point.count), 1);
  const total = data.reduce((sum, point) => sum + point.count, 0);

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
        <div className="h-52 flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <p className="text-xs text-slate-400">No activity in the last 30 days</p>
        </div>
      ) : (
        <div className="h-52 flex items-end gap-1 px-1 pt-2 border-t border-slate-100">
          {data.map((point) => {
            const height = Math.max((point.count / maxCount) * 100, 6);
            const label = new Date(point.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });
            return (
              <div
                key={point.date}
                className="flex-1 min-w-0 flex flex-col items-center gap-1.5 group"
                title={`${label}: ${point.count}`}
              >
                <span className="text-[10px] font-semibold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {point.count}
                </span>
                <div
                  className={`w-full rounded-t-lg bg-gradient-to-t ${accentClass} opacity-90 group-hover:opacity-100 transition-opacity`}
                  style={{ height: `${height}%` }}
                />
                <span className="text-[9px] text-slate-400 truncate w-full text-center">
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
