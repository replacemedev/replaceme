import type { SubscriptionTier } from "@/types/employer/billing";

const TIER_LABELS: Record<SubscriptionTier, string> = {
  discovery: "Discovery",
  starter: "Starter",
  growth: "Growth",
  scale: "Scale",
};

const TIER_STYLES: Record<SubscriptionTier, string> = {
  discovery: "bg-slate-100 text-slate-600 border-slate-200",
  starter: "bg-blue-50 text-blue-700 border-blue-200",
  growth: "bg-[#ebfdf2] text-[#006e2f] border-[#006e2f]/25",
  scale: "bg-violet-50 text-violet-700 border-violet-200",
};

interface PlanTierBadgeProps {
  tier: SubscriptionTier | string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PlanTierBadge({
  tier,
  className = "",
  size = "md",
}: PlanTierBadgeProps) {
  const normalized = tier.toLowerCase() as SubscriptionTier;
  const label =
    TIER_LABELS[normalized] ??
    tier.charAt(0).toUpperCase() + tier.slice(1);
  const style =
    TIER_STYLES[normalized] ?? "bg-slate-100 text-slate-600 border-slate-200";

  const sizeClass =
    size === "lg"
      ? "px-3 py-1 text-[11px]"
      : size === "sm"
        ? "px-2 py-0.5 text-[9px]"
        : "px-2.5 py-0.5 text-[10px]";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-extrabold uppercase tracking-wide ${sizeClass} ${style} ${className}`}
    >
      {label}
    </span>
  );
}
