import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { WORKER_CARD } from "@/lib/worker/ui-tokens";

export interface WorkerKpiItem {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  href?: string;
}

interface WorkerKpiStripProps {
  items: WorkerKpiItem[];
  className?: string;
}

export function WorkerKpiStrip({ items, className = "" }: WorkerKpiStripProps) {
  if (items.length === 0) return null;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 ${className}`}>
      {items.map((item) => {
        const Icon = item.icon;
        const card = (
          <div
            className={`${WORKER_CARD} flex flex-col gap-1 p-4 ${
              item.href
                ? "transition-colors hover:border-[#006e2f]/20 hover:bg-[#fafdfb]"
                : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {item.label}
              </span>
              {Icon ? (
                <Icon className="h-4 w-4 text-[#006e2f]/70 shrink-0" aria-hidden />
              ) : null}
            </div>
            <span className="text-xl font-extrabold text-slate-900 tabular-nums leading-none">
              {item.value}
            </span>
            {item.hint ? (
              <span className="text-[11px] font-medium text-slate-500">
                {item.hint}
              </span>
            ) : null}
          </div>
        );

        return item.href ? (
          <Link key={item.label} href={item.href} className="block">
            {card}
          </Link>
        ) : (
          <div key={item.label}>{card}</div>
        );
      })}
    </div>
  );
}
