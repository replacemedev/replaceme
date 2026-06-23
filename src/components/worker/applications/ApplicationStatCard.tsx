import {
  FileText,
  Hourglass,
  CalendarDays,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

type StatVariant = "default" | "review" | "interview";

interface ApplicationStatCardProps {
  label: string;
  value: number;
  badge?: string;
  badgeIcon?: LucideIcon;
  variant?: StatVariant;
  watermarkIcon: LucideIcon;
}

const variantStyles: Record<
  StatVariant,
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

export function ApplicationStatCard({
  label,
  value,
  badge,
  badgeIcon: BadgeIcon,
  variant = "default",
  watermarkIcon: WatermarkIcon,
}: ApplicationStatCardProps) {
  const styles = variantStyles[variant];

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
