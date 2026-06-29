interface ChatAreaSkeletonProps {
  mobileHidden?: boolean;
}

export function ChatAreaSkeleton({ mobileHidden = false }: ChatAreaSkeletonProps) {
  return (
    <section
      className={`flex-1 flex flex-col h-full bg-[#f8fafd]/40 min-w-0 animate-pulse ${
        mobileHidden ? "hidden lg:flex" : ""
      }`}
      aria-busy="true"
      aria-label="Loading conversation"
    >
      <header className="shrink-0 h-16 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-40 rounded bg-slate-200" />
          <div className="h-2.5 w-24 rounded bg-slate-100" />
        </div>
      </header>

      <div className="flex-1 overflow-hidden px-6 py-6 space-y-6">
        <div className="flex justify-start">
          <div className="h-12 w-56 rounded-2xl bg-slate-200" />
        </div>
        <div className="flex justify-end">
          <div className="h-10 w-44 rounded-2xl bg-slate-100" />
        </div>
        <div className="flex justify-start">
          <div className="h-16 w-64 rounded-2xl bg-slate-200" />
        </div>
        <div className="flex justify-end">
          <div className="h-12 w-52 rounded-2xl bg-slate-100" />
        </div>
      </div>

      <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-4">
        <div className="h-11 w-full rounded-xl bg-slate-100" />
      </footer>
    </section>
  );
}
