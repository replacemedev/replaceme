import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type AdminStatCardProps = {
  variant?: "admin";
  label: string;
  value: number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accentColor?: string;
};

type DashboardStatCardProps = {
  variant: "dashboard";
  title: string;
  value: number | string;
  icon: ReactNode;
  iconBgClass: string;
  iconColorClass: string;
};

type ApplicationStatVariant = "default" | "review" | "interview";

type ApplicationStatCardProps = {
  variant: "application";
  label: string;
  value: number;
  badge?: string;
  badgeIcon?: LucideIcon;
  applicationVariant?: ApplicationStatVariant;
  watermarkIcon: LucideIcon;
};

export type StatCardProps =
  | AdminStatCardProps
  | DashboardStatCardProps
  | ApplicationStatCardProps;

const applicationVariantStyles: Record<
  ApplicationStatVariant,
  { card: string; label: string; watermark: string; badge: string }
> = {
  default: {
    card: "bg-white border-slate-200",
    label: "text-slate-500",
    watermark: "text-slate-200",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  review: {
    card: "bg-[#f4faf6] border-emerald-100",
    label: "text-emerald-700",
    watermark: "text-emerald-200",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  interview: {
    card: "bg-[#f0f7ff] border-blue-100",
    label: "text-blue-700",
    watermark: "text-blue-200",
    badge: "bg-blue-50 text-blue-700 border-blue-100",
  },
};

function AdminStatCard({
  label,
  value,
  icon: Icon,
  trend,
  accentColor = "bg-emerald-50 text-emerald-600",
}: AdminStatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
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
          className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-lg ${accentColor}`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </article>
  );
}

function DashboardStatCard({
  title,
  value,
  icon,
  iconBgClass,
  iconColorClass,
}: DashboardStatCardProps) {
  return (
    <div className="flex flex-col justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-xs gap-3 relative overflow-hidden select-none">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 tracking-tight leading-snug">
          {title}
        </span>
        <div
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${iconBgClass} ${iconColorClass}`}
        >
          {icon}
        </div>
      </div>
      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none tabular-nums">
        {value}
      </span>
    </div>
  );
}

function ApplicationStatCard({
  label,
  value,
  badge,
  badgeIcon: BadgeIcon,
  applicationVariant = "default",
  watermarkIcon: WatermarkIcon,
}: ApplicationStatCardProps) {
  const styles = applicationVariantStyles[applicationVariant];

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-xs ${styles.card}`}
    >
      <WatermarkIcon
        className={`absolute top-3 right-3 h-8 w-8 sm:h-10 sm:w-10 ${styles.watermark}`}
        strokeWidth={1.5}
        aria-hidden
      />

      <p
        className={`text-[11px] font-bold uppercase tracking-wider ${styles.label}`}
      >
        {label}
      </p>
      <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none">
        {value}
      </p>

      {badge && (
        <span
          className={`mt-2.5 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles.badge}`}
        >
          {BadgeIcon && <BadgeIcon className="h-3 w-3" aria-hidden />}
          {badge}
        </span>
      )}
    </article>
  );
}

export function StatCard(props: StatCardProps) {
  if (props.variant === "dashboard") {
    return <DashboardStatCard {...props} />;
  }
  if (props.variant === "application") {
    return <ApplicationStatCard {...props} />;
  }
  return <AdminStatCard {...props} />;
}
