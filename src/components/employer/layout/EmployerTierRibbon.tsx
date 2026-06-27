export type EmployerTierRibbonVariant =
  | "current"
  | "priority"
  | "scale"
  | "popular";

const VARIANT_CLASSES: Record<EmployerTierRibbonVariant, string> = {
  current: "bg-[#006e2f] text-white",
  priority: "bg-[#ebfdf2] text-[#006e2f] border border-[#006e2f]/20",
  scale: "bg-slate-900 text-white",
  popular: "bg-[#ebfdf2] text-[#006e2f] border border-[#006e2f]/30",
};

interface EmployerTierRibbonProps {
  variant: EmployerTierRibbonVariant;
  label: string;
  className?: string;
}

export function EmployerTierRibbon({
  variant,
  label,
  className = "",
}: EmployerTierRibbonProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {label}
    </span>
  );
}
