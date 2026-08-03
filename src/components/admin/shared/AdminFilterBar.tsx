import type { ReactNode } from "react";
import { Search } from "lucide-react";

interface AdminFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  onOpenFilters?: () => void;
  filtersLabel?: string;
  className?: string;
}

export function AdminFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  children,
  onOpenFilters,
  filtersLabel = "Filters",
  className = "",
}: AdminFilterBarProps) {
  return (
    <div className={`flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3.5 w-full ${className}`}>
      {/* Group 1: Primary Search */}
      <div className="relative w-full xl:max-w-md flex-1">
        <Search
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none"
          aria-hidden
        />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30"
        />
      </div>

      {/* Group 2: Secondary Filters & Actions */}
      {children || onOpenFilters ? (
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2.5 w-full xl:w-auto">
          {onOpenFilters ? (
            <button
              type="button"
              onClick={onOpenFilters}
              className="h-10 w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              {filtersLabel}
            </button>
          ) : null}
          {children}
        </div>
      ) : null}
    </div>
  );
}

