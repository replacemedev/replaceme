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
  security: "bg-red-50 text-red-600 border-red-100",
  moderation: "bg-amber-50 text-amber-600 border-amber-100",
  system: "bg-blue-50 text-blue-600 border-blue-100",
};

export function UrgentAlerts({ alerts }: UrgentAlertsProps) {
  if (alerts.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <h2 className="text-sm font-bold text-slate-900 mb-4">
          Urgent Alerts
        </h2>
        <p className="text-sm text-slate-400 text-center py-6">
          No urgent alerts. All systems nominal.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <h2 className="text-sm font-bold text-slate-900 mb-4">Urgent Alerts</h2>
      <ul className="space-y-2.5">
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
    </section>
  );
}
