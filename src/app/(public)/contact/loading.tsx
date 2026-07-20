import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";
import { LegalPageSkeleton } from "@/components/shared/LegalPageSkeleton";

export default function ContactLoading() {
  return (
    <main className={`${PUBLIC_PAGE_TOP} min-h-[calc(100vh-4rem)] bg-[#f8fafe] flex-1 animate-pulse`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="h-4 w-20 bg-gray-200 rounded mx-auto mb-4" />
        <div className="h-10 w-48 bg-gray-200 rounded mx-auto mb-3" />
        <div className="h-4 w-64 bg-gray-200 rounded mx-auto mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-28 bg-gray-200 rounded-2xl" />
          <div className="h-28 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </main>
  );
}
