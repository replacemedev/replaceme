import type { ReactNode } from "react";
import { Search } from "lucide-react";

interface AdminFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  onOpenFilters?: () => void;
  filtersLabel?: string;
}

export function AdminFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  children,
  onOpenFilters,
  filtersLabel = "Filters",
}: AdminFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-md">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30"
        />
      </div>
      <div className="flex items-center gap-2">
        {onOpenFilters ? (
          <button
            type="button"
            onClick={onOpenFilters}
            className="md:hidden inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {filtersLabel}
          </button>
        ) : null}
        {children}
      </div>
    </div>
  );
}
