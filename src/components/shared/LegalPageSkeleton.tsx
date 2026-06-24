import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function LegalPageSkeleton() {
  return (
    <>
      <Header />
      <main className="pt-24 sm:pt-28 pb-16 min-h-[calc(100vh-4rem)] bg-[#f8fafe] flex-1">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-10 sm:h-12 lg:h-14 w-2/3 max-w-md bg-gray-200 rounded-lg mb-8 sm:mb-10" />
          <section className="min-h-[320px] rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 lg:p-10 shadow-xs">
            <div className="space-y-4">
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-5/6 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-4/6 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
