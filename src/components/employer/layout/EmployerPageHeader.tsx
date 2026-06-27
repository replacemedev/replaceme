import type { ReactNode } from "react";
import {
  EMPLOYER_PAGE_SUBHEAD,
  EMPLOYER_PAGE_TITLE,
} from "@/lib/employer/ui-tokens";

interface EmployerPageHeaderProps {
  title: ReactNode;
  subhead?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  bordered?: boolean;
  className?: string;
}

export function EmployerPageHeader({
  title,
  subhead,
  badge,
  actions,
  bordered = true,
  className = "",
}: EmployerPageHeaderProps) {
  return (
    <header
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
        bordered ? "border-b border-slate-100 pb-6" : ""
      } ${className}`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className={EMPLOYER_PAGE_TITLE}>{title}</h1>
          {badge}
        </div>
        {subhead ? (
          <p className={EMPLOYER_PAGE_SUBHEAD}>{subhead}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
