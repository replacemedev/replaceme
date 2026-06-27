import type { ReactNode } from "react";
import { EMPLOYER_CARD } from "@/lib/employer/ui-tokens";

interface EmployerSectionCardProps {
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  padded?: boolean;
}

export function EmployerSectionCard({
  title,
  description,
  action,
  children,
  className = "",
  bodyClassName = "",
  padded = true,
}: EmployerSectionCardProps) {
  return (
    <section className={`${EMPLOYER_CARD} overflow-hidden ${className}`}>
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {description ? (
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={padded ? `p-5 ${bodyClassName}` : bodyClassName}>
        {children}
      </div>
    </section>
  );
}
