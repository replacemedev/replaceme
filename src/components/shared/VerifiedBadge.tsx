import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  show?: boolean;
  size?: "sm" | "md";
  showTooltip?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
};

export function VerifiedBadge({
  show = true,
  size = "sm",
  showTooltip = true,
  className = "",
}: VerifiedBadgeProps) {
  if (!show) return null;

  return (
    <span
      className={`inline-flex items-center text-[#006e2f] shrink-0 ${className}`}
      title={showTooltip ? "Verified worker" : undefined}
      aria-label="Verified worker"
    >
      <BadgeCheck className={sizeClasses[size]} aria-hidden />
    </span>
  );
}
