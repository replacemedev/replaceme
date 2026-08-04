import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";

export default function ContactLoading() {
  return (
    <main className={`${PUBLIC_PAGE_TOP} min-h-[calc(100vh-4rem)] bg-[#f8fafe] flex-1 animate-pulse`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="h-4 w-20 bg-slate-200 rounded mx-auto mb-3" />
        <div className="h-9 sm:h-10 w-48 sm:w-60 bg-slate-200 rounded-xl mx-auto mb-3" />
        <div className="h-4 w-64 sm:w-80 bg-slate-100 rounded mx-auto mb-10" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 w-16 bg-slate-200 rounded" />
              <div className="h-4 w-32 bg-slate-100 rounded" />
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 w-16 bg-slate-200 rounded" />
              <div className="h-4 w-36 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

