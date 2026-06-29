import { Users, Lock } from "lucide-react";
import { UpgradeCTA } from "./UpgradeCTA";

interface HiddenApplicantsBannerProps {
  hiddenCount: number;
  visibleCount: number;
  capLimit: number | null;
  currentPlan: string;
  className?: string;
}

export function HiddenApplicantsBanner({
  hiddenCount,
  visibleCount,
  capLimit,
  currentPlan,
  className = "",
}: HiddenApplicantsBannerProps) {
  if (hiddenCount <= 0) return null;

  const capLabel =
    capLimit !== null ? `${visibleCount} of ${capLimit} visible` : `${visibleCount} visible`;

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/90 to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between ${className}`}
      role="status"
    >
      <div className="flex items-start gap-3 min-w-0">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Lock className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-bold text-amber-950">
            {hiddenCount === 1
              ? "1 applicant is hidden on your plan"
              : `${hiddenCount} applicants are hidden on your plan`}
          </p>
          <p className="text-xs font-medium leading-relaxed text-amber-900/80">
            You can review {capLabel}. Upgrade to unlock the full pipeline and
            see every candidate who applied.
          </p>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-800/70">
            <Users className="h-3.5 w-3.5" aria-hidden />
            {hiddenCount} waiting behind your cap
          </p>
        </div>
      </div>
      <UpgradeCTA
        feature="applicant_cap"
        currentPlan={currentPlan}
        className="w-full shrink-0 sm:w-auto justify-center"
      />
    </div>
  );
}
