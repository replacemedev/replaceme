import type { TimeSeriesPoint } from "@/types/admin.types";

interface MetricsChartProps {
  title: string;
  data: TimeSeriesPoint[];
}

export function MetricsChart({ title, data }: MetricsChartProps) {
  const maxCount = Math.max(...data.map((point) => point.count), 1);

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <h2 className="text-sm font-bold text-slate-900 mb-4">{title}</h2>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <p className="text-xs text-slate-400">No activity in the last 30 days</p>
        </div>
      ) : (
        <div className="h-48 flex items-end gap-1 px-1">
          {data.map((point) => {
            const height = Math.max((point.count / maxCount) * 100, 4);
            const label = new Date(point.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });
            return (
              <div
                key={point.date}
                className="flex-1 min-w-0 flex flex-col items-center gap-1"
                title={`${label}: ${point.count}`}
              >
                <div
                  className="w-full rounded-t-md bg-emerald-500/80 hover:bg-emerald-500 transition-colors"
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
