import type { ReactNode } from "react";
import { ADMIN_CARD } from "@/lib/admin/ui-tokens";

interface AdminDataTableProps {
  /** Desktop table markup (`<table>` inside). Hidden below `lg`. */
  children: ReactNode;
  /** Card list for mobile. Shown below `lg`. */
  mobileCards: ReactNode;
  className?: string;
}

export function AdminDataTable({
  children,
  mobileCards,
  className = "",
}: AdminDataTableProps) {
  return (
    <>
      <div className={`lg:hidden space-y-3 ${className}`}>{mobileCards}</div>
      <div
        className={`hidden lg:block overflow-x-auto w-full max-w-full rounded-lg shadow-sm border border-gray-200 bg-white ${className}`}
      >
        {children}
      </div>
    </>
  );
}

export const ADMIN_TABLE_HEAD =
  "border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide";

export const ADMIN_TABLE_TH = "px-4 py-3 whitespace-nowrap";

export const ADMIN_TABLE_ROW = "hover:bg-slate-50/50";

export const ADMIN_TABLE_TD = "px-4 py-3 align-middle";

export function AdminMobileCard({
  children,
  actions,
}: {
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <article className={`${ADMIN_CARD} p-4 space-y-3`}>
      <div className="space-y-2">{children}</div>
      {actions ? (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-50">
          {actions}
        </div>
      ) : null}
    </article>
  );
}
