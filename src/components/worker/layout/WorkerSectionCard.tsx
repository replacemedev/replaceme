import type { ReactNode } from "react";
import { WORKER_CARD, WORKER_SECTION_TITLE } from "@/lib/worker/ui-tokens";

interface WorkerSectionCardProps {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function WorkerSectionCard({
  title,
  action,
  children,
  className = "",
}: WorkerSectionCardProps) {
  return (
    <section className={`${WORKER_CARD} p-6 ${className}`}>
      {title || action ? (
        <header className="flex items-center justify-between gap-3 mb-4">
          {title ? <h2 className={WORKER_SECTION_TITLE}>{title}</h2> : <span />}
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}
