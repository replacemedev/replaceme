import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type AdminBreadcrumbItem = {
  label: string;
  href?: string;
};

interface AdminBreadcrumbProps {
  items: AdminBreadcrumbItem[];
}

export function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-400"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span
            key={`${item.label}-${index}`}
            className="inline-flex items-center gap-1.5"
          >
            {index > 0 ? (
              <ChevronRight
                className="h-3.5 w-3.5 text-slate-300"
                aria-hidden
              />
            ) : null}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-[#006e2f] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-slate-600" : undefined}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
