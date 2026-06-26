interface AdminFilterPillsProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  counts?: Partial<Record<string, number>>;
}

export function AdminFilterPills({
  options,
  value,
  onChange,
  counts,
}: AdminFilterPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = value === option;
        const count = counts?.[option];
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors shadow-xs ${
              isActive
                ? "bg-[#006e2f] text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            {option}
            {count !== undefined && count > 0 ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-[#ebfdf2] text-[#006e2f]"
                }`}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function AdminSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
      {children}
    </h2>
  );
}
