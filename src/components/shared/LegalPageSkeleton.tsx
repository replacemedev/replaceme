import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";

export function LegalPageSkeleton() {
  return (
    <main className={`${PUBLIC_PAGE_TOP} min-h-[calc(100vh-4rem)] bg-[#f8fafe] flex-1 animate-pulse`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <div className="h-4 w-28 bg-gray-200 rounded mx-auto mb-4" />
          <div className="h-10 sm:h-12 w-64 bg-gray-200 rounded mx-auto mb-3" />
          <div className="h-4 w-48 bg-gray-200 rounded mx-auto" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-8">
          <div className="hidden lg:block h-64 bg-gray-200 rounded-xl" />
          <div className="min-h-[480px] rounded-2xl border border-slate-100 bg-white p-8 space-y-4">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-5/6 bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-4/6 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </main>
  );
}
