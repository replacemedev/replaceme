import type { ReactNode } from "react";
import { EmployerBackButton } from "./EmployerBackButton";

export type EmployerBreadcrumbItem = {
  label: string;
  href?: string;
};

interface EmployerBreadcrumbProps {
  items: EmployerBreadcrumbItem[];
}

export function EmployerBreadcrumb({ items }: EmployerBreadcrumbProps) {
  const label =
    items.length > 1
      ? `Back to ${items[items.length - 2]?.label ?? "Dashboard"}`
      : "Back";

  const fallbackHref =
    items.length > 1 ? items[items.length - 2]?.href : undefined;

  return (
    <div className="flex items-center justify-between gap-3">
      <EmployerBackButton
        fallbackHref={fallbackHref ?? "/employer/dashboard"}
        label={label}
      />
      <span className="text-xs font-bold text-slate-400 truncate">
        {items[items.length - 1]?.label as ReactNode}
      </span>
    </div>
  );
}
