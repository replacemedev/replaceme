import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { EMPLOYER_CARD } from "@/lib/employer/ui-tokens";

export interface EmployerKpiItem {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  href?: string;
}

interface EmployerKpiStripProps {
  items: EmployerKpiItem[];
  className?: string;
}

export function EmployerKpiStrip({ items, className = "" }: EmployerKpiStripProps) {
  if (items.length === 0) return null;

  return (
    <div
      className={`grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 ${className}`}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const card = (
          <div
            className={`${EMPLOYER_CARD} flex min-w-0 flex-col gap-1 overflow-hidden p-4 ${
              item.href
                ? "transition-colors hover:border-[#006e2f]/20 hover:bg-[#fafdfb]"
                : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="min-w-0 flex-1 truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {item.label}
              </span>
              {Icon ? (
                <Icon className="h-4 w-4 text-[#006e2f]/70 shrink-0" aria-hidden />
              ) : null}
            </div>
            <span className="text-xl font-extrabold text-slate-900 tabular-nums leading-none min-w-0">
              {item.value}
            </span>
            {item.hint ? (
              <span className="min-w-0 text-[11px] font-medium text-slate-500 leading-snug">
                {item.hint}
              </span>
            ) : null}
          </div>
        );

        return item.href ? (
          <Link key={item.label} href={item.href} className="block min-w-0">
            {card}
          </Link>
        ) : (
          <div key={item.label} className="min-w-0">{card}</div>
        );
      })}
    </div>
  );
}
