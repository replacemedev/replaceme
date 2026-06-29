import type { ReactNode } from "react";
import {
  ADMIN_PAGE_SUBHEAD,
  ADMIN_PAGE_TITLE,
} from "@/lib/admin/ui-tokens";

interface AdminPageHeaderProps {
  title: ReactNode;
  subhead?: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  bordered?: boolean;
  className?: string;
}

/** Layout-level page header with premium typography tokens. */
export function AdminLayoutPageHeader({
  title,
  subhead,
  description,
  badge,
  actions,
  bordered = false,
  className = "",
}: AdminPageHeaderProps) {
  const body = subhead ?? description;

  return (
    <header
      className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 ${
        bordered ? "border-b border-slate-100 pb-6" : ""
      } ${className}`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className={ADMIN_PAGE_TITLE}>{title}</h1>
          {badge}
        </div>
        {body ? <p className={ADMIN_PAGE_SUBHEAD}>{body}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
