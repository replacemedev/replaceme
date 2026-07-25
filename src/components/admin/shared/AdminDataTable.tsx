import type { ReactNode } from "react";
import { ADMIN_CARD } from "@/lib/admin/ui-tokens";

interface AdminDataTableProps {
  /** Desktop/tablet table markup (`<table>` inside). Hidden below `md`. */
  children: ReactNode;
  /** Card list for mobile. Shown below `md`. */
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
      <div className={`md:hidden space-y-3 min-w-0 w-full ${className}`}>
        {mobileCards}
      </div>
      <div
        className={`hidden md:block overflow-x-auto w-full max-w-full rounded-lg shadow-sm border border-gray-200 bg-white ${className}`}
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

type ActionsPlacement = "header" | "footer";

export function AdminMobileCard({
  children,
  actions,
  actionsPlacement = "footer",
}: {
  children: ReactNode;
  actions?: ReactNode;
  /** `header` pins actions top-right (meatball menus). `footer` keeps action rows under content. */
  actionsPlacement?: ActionsPlacement;
}) {
  if (actions && actionsPlacement === "header") {
    return (
      <article
        className={`${ADMIN_CARD} relative z-0 p-4 min-w-0 w-full max-w-full overflow-visible has-[details[open]]:z-40`}
      >
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1 space-y-2.5">{children}</div>
          <div className="relative z-20 shrink-0 -mt-0.5 -mr-0.5">{actions}</div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`${ADMIN_CARD} relative z-0 p-4 space-y-3 min-w-0 w-full max-w-full overflow-visible has-[details[open]]:z-40`}
    >
      <div className="min-w-0 space-y-2">{children}</div>
      {actions ? (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {actions}
        </div>
      ) : null}
    </article>
  );
}
