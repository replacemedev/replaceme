import Link from "next/link";
import type { UrgentAlert } from "@/types/admin.types";
import { AlertTriangle, ShieldAlert, Clock } from "lucide-react";

interface UrgentAlertsProps {
  alerts: UrgentAlert[];
}

const ALERT_ICONS: Record<string, typeof ShieldAlert> = {
  security: ShieldAlert,
  moderation: AlertTriangle,
  system: Clock,
};

const ALERT_STYLES: Record<string, string> = {
  security: "bg-red-50 text-red-700 border-red-100",
  moderation: "bg-amber-50 text-amber-700 border-amber-100",
  system: "bg-blue-50 text-blue-700 border-blue-100",
};

export function UrgentAlerts({ alerts }: UrgentAlertsProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-bold text-slate-900">Urgent Alerts</h2>
        <span
          className={`inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
            alerts.length > 0
              ? "bg-red-100 text-red-700"
              : "bg-[#ebfdf2] text-[#006e2f]"
          }`}
        >
          {alerts.length}
        </span>
      </div>
      {alerts.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8 rounded-xl bg-slate-50/80 border border-dashed border-slate-200">
          No urgent alerts. All systems nominal.
        </p>
      ) : (
        <ul className="space-y-2.5 max-h-[280px] overflow-y-auto">
          {alerts.map((alert) => {
            const Icon = ALERT_ICONS[alert.type] ?? AlertTriangle;
            const style = ALERT_STYLES[alert.type] ?? ALERT_STYLES.moderation;
            return (
              <li
                key={alert.id}
                className={`flex items-start gap-3 rounded-xl border p-3 ${style}`}
              >
                <Icon className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
                <div className="min-w-0">
                  <p className="text-xs font-medium leading-relaxed">
                    {alert.message}
                  </p>
                  <p className="text-[10px] opacity-70 mt-0.5">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
