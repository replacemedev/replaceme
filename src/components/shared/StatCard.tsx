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

function DashboardStatCard({
  title,
  value,
  icon,
  iconBgClass,
  iconColorClass,
}: DashboardStatCardProps) {
  return (
    <div className="flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-xs gap-4 relative overflow-hidden select-none">
      <div className="flex items-start justify-between">
        <span className="text-sm font-semibold text-slate-500 tracking-tight">
          {title}
        </span>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBgClass} ${iconColorClass}`}
        >
          {icon}
        </div>
      </div>
      <span className="text-4xl font-extrabold text-slate-900 leading-none">
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
      className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 shadow-xs ${styles.card}`}
    >
      <WatermarkIcon
        className={`absolute top-4 right-4 h-10 w-10 sm:h-12 sm:w-12 ${styles.watermark}`}
        strokeWidth={1.5}
        aria-hidden
      />

      <p
        className={`text-[11px] font-bold uppercase tracking-wider ${styles.label}`}
      >
        {label}
      </p>
      <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 leading-none">
        {value}
      </p>

      {badge && (
        <span
          className={`mt-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles.badge}`}
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
