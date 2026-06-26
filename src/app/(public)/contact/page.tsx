import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { getPublishedPageContent } from "@/actions/public/page-content";
import { CONTACT_FALLBACK } from "@/lib/content/page-fallbacks";
import type { ContactPageConfig } from "@/types/page-content";

export const metadata = {
  title: "Contact Us | ReplaceMe",
  description: "Get in touch with the ReplaceMe support team.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const cms = await getPublishedPageContent("contact");
  const config: ContactPageConfig = {
    ...CONTACT_FALLBACK,
    ...(cms?.contentJson as Partial<ContactPageConfig>),
    title: cms?.title ?? CONTACT_FALLBACK.title,
  };

  return (
    <main className="pt-20 pb-16 min-h-[calc(100vh-4rem)] bg-[#f8fafe] flex-1">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-[#22c55e] mb-3">
          {config.badge}
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          {config.title}
        </h1>
        <p className="text-sm text-slate-500 mb-10">{config.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <a
            href={`mailto:${config.email}`}
            className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-[#22c55e]/30 transition-colors"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-[#22c55e] shrink-0">
              <Mail className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block font-bold text-slate-900 mb-1">Email</span>
              <span className="text-sm text-slate-600">{config.email}</span>
            </span>
          </a>

          <Link
            href="/privacy-policy"
            className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-[#22c55e]/30 transition-colors"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-[#22c55e] shrink-0">
              <MessageCircle className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block font-bold text-slate-900 mb-1">Privacy</span>
              <span className="text-sm text-slate-600">Read our privacy policy</span>
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
