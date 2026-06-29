import type { ReactNode } from "react";
import { ADMIN_CARD } from "@/lib/admin/ui-tokens";

export interface AdminStatItem {
  label: string;
  value: ReactNode;
  hint?: string;
}

interface AdminStatStripProps {
  items: AdminStatItem[];
}

export function AdminStatStrip({ items }: AdminStatStripProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => (
        <div key={item.label} className={`${ADMIN_CARD} px-4 py-3 sm:px-5 sm:py-4`}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {item.label}
          </p>
          <p className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {item.value}
          </p>
          {item.hint ? (
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.hint}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
