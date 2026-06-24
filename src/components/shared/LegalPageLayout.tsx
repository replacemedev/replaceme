import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface LegalPageLayoutProps {
  title: string;
  children?: React.ReactNode;
}

export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  return (
    <>
      <Header />
      <main className="pt-24 sm:pt-28 pb-16 min-h-[calc(100vh-4rem)] bg-[#f8fafe] flex-1">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-8 sm:mb-10">
            {title}
          </h1>
          <section
            className="min-h-[320px] rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 shadow-xs"
            aria-label={`${title} content`}
          >
            {children}
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
