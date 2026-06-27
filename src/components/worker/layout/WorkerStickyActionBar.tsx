interface WorkerStickyActionBarProps {
  children: React.ReactNode;
}

/** Mobile-only sticky CTA bar above the bottom tab bar. */
export function WorkerStickyActionBar({ children }: WorkerStickyActionBarProps) {
  return (
    <div className="lg:hidden fixed bottom-[calc(56px+env(safe-area-inset-bottom))] inset-x-0 z-30 border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      {children}
    </div>
  );
}
