import { Lock } from "lucide-react";
import {
  featureGateCopy,
  type EntitlementFeature,
} from "@/lib/entitlements/ui-copy";
import { UpgradeCTA } from "./UpgradeCTA";

interface UnlockOverlayProps {
  feature: EntitlementFeature;
  currentPlan: string;
  compact?: boolean;
  className?: string;
}

export function UnlockOverlay({
  feature,
  currentPlan,
  compact = false,
  className = "",
}: UnlockOverlayProps) {
  const copy = featureGateCopy(feature, currentPlan);

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 backdrop-blur-md ${className}`}
      >
        <Lock className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
        <p className="min-w-0 flex-1 text-[11px] font-semibold text-slate-600">
          {copy.title}
        </p>
        <UpgradeCTA
          feature={feature}
          currentPlan={currentPlan}
          variant="inline"
          label={`Unlock`}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-5 backdrop-blur-md ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <Lock className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-bold text-slate-900">{copy.title}</p>
          <p className="text-xs font-medium leading-relaxed text-slate-600">
            {copy.description}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {copy.tierLabel} · ${copy.price}/mo USD
          </p>
        </div>
      </div>
      <div className="mt-4">
        <UpgradeCTA feature={feature} currentPlan={currentPlan} />
      </div>
    </div>
  );
}
