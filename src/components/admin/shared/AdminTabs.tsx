"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface AdminTab {
  id: string;
  label: string;
  count?: number;
}

interface AdminTabsProps {
  tabs: AdminTab[];
  paramKey?: string;
}

export function AdminTabs({ tabs, paramKey = "tab" }: AdminTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get(paramKey) ?? tabs[0]?.id;

  return (
    <nav className="flex w-full overflow-x-auto flex-nowrap custom-scrollbar gap-1 border-b border-slate-200 overscroll-x-contain">
      {tabs.map((tab) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(paramKey, tab.id);
        params.delete("page");
        const href = `${pathname}?${params.toString()}`;
        const isActive = active === tab.id;

        return (
          <Link
            key={tab.id}
            href={href}
            className={`shrink-0 min-h-[44px] inline-flex items-center whitespace-nowrap px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors capitalize ${
              isActive
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="capitalize">{tab.label}</span>
            {tab.count !== undefined ? (
              <span className="ml-1.5 text-xs font-medium text-slate-400">
                ({tab.count})
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
