"use client";

import {
  APPLICATION_STATUS_FILTERS,
  ApplicationDateFilter,
  WorkerApplicationStatus,
} from "@/types/applications";

interface ApplicationFilterSidebarProps {
  dateFilter: ApplicationDateFilter;
  onDateFilterChange: (value: ApplicationDateFilter) => void;
  statusFilters: WorkerApplicationStatus[];
  onStatusToggle: (status: WorkerApplicationStatus) => void;
  onClearAll: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const DATE_OPTIONS: { value: ApplicationDateFilter; label: string }[] = [
  { value: "anytime", label: "Anytime" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "last_90_days", label: "Last 90 days" },
];

function FilterPanel({
  dateFilter,
  onDateFilterChange,
  statusFilters,
  onStatusToggle,
  onClearAll,
}: Omit<ApplicationFilterSidebarProps, "mobileOpen" | "onMobileClose">) {
  return (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-sm font-bold text-slate-900">Filters</h2>
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-semibold text-[#006e2f] hover:underline cursor-pointer"
      >
        Clear all
      </button>
    </div>

    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Date Sent
        </p>
        <select
          value={dateFilter}
          onChange={(e) =>
            onDateFilterChange(e.target.value as ApplicationDateFilter)
          }
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-[#006e2f] focus:border-[#006e2f] cursor-pointer"
        >
          {DATE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Status
        </p>
        <ul className="space-y-2">
          {APPLICATION_STATUS_FILTERS.map((item) => {
            const checked = statusFilters.includes(item.value);
            return (
              <li key={item.value}>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onStatusToggle(item.value)}
                    className="h-4 w-4 rounded border-slate-300 text-[#006e2f] focus:ring-[#006e2f]/30 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">
                    {item.label}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  </div>
  );
}

export function ApplicationFilterSidebar(props: ApplicationFilterSidebarProps) {
  const { mobileOpen, onMobileClose, ...panelProps } = props;

  return (
    <>
      <div className="hidden lg:block">
        <FilterPanel {...panelProps} />
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex" role="dialog" aria-modal>
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onMobileClose}
            aria-label="Close filters"
          />
          <div className="relative ml-auto w-full max-w-xs h-full bg-white p-4 overflow-y-auto shadow-2xl">
            <FilterPanel {...panelProps} />
          </div>
        </div>
      )}
    </>
  );
}
