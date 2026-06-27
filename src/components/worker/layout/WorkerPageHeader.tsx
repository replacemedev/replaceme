import type { ReactNode } from "react";
import {
  WORKER_PAGE_SUBHEAD,
  WORKER_PAGE_TITLE,
} from "@/lib/worker/ui-tokens";

interface WorkerPageHeaderProps {
  title: ReactNode;
  subhead?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  bordered?: boolean;
  className?: string;
}

export function WorkerPageHeader({
  title,
  subhead,
  badge,
  actions,
  bordered = true,
  className = "",
}: WorkerPageHeaderProps) {
  return (
    <header
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
        bordered ? "border-b border-slate-100 pb-6" : ""
      } ${className}`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className={WORKER_PAGE_TITLE}>{title}</h1>
          {badge}
        </div>
        {subhead ? <p className={WORKER_PAGE_SUBHEAD}>{subhead}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
