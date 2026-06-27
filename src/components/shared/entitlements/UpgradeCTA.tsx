import Link from "next/link";
import {
  featureGateCopy,
  type EntitlementFeature,
} from "@/lib/entitlements/ui-copy";

type UpgradeCTAVariant = "primary" | "secondary" | "inline";

interface UpgradeCTAProps {
  feature: EntitlementFeature;
  currentPlan: string;
  variant?: UpgradeCTAVariant;
  className?: string;
  label?: string;
  compareHref?: string;
}

const VARIANT_CLASSES: Record<UpgradeCTAVariant, string> = {
  primary:
    "inline-flex items-center justify-center rounded-xl bg-[#006e2f] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#005c26]",
  secondary:
    "inline-flex items-center justify-center rounded-xl border border-[#006e2f]/20 bg-[#ebfdf2] px-4 py-2.5 text-xs font-bold text-[#006e2f] transition-colors hover:bg-[#d4f8e4]",
  inline:
    "inline-flex text-xs font-bold text-[#006e2f] hover:underline",
};

export function UpgradeCTA({
  feature,
  currentPlan,
  variant = "primary",
  className = "",
  label,
  compareHref = "/employer/pricing",
}: UpgradeCTAProps) {
  const copy = featureGateCopy(feature, currentPlan);
  const href = `/employer/checkout/${copy.tier}`;
  const text =
    label ?? `Upgrade to ${copy.tierLabel} — $${copy.price}/mo`;

  if (variant === "inline") {
    return (
      <Link href={href} className={`${VARIANT_CLASSES.inline} ${className}`}>
        {text} →
      </Link>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <Link href={href} className={VARIANT_CLASSES[variant]}>
        {text}
      </Link>
      {compareHref ? (
        <Link
          href={compareHref}
          className="text-[11px] font-semibold text-slate-500 hover:text-slate-700"
        >
          Compare plans
        </Link>
      ) : null}
    </div>
  );
}
