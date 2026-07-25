import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  ACCOUNT_LIFECYCLE_TIMELINES,
  DELETION_REQUEST_SLA,
  DELETION_REQUEST_SUPPORT_EMAIL,
} from "@/lib/data/legal";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Close or Delete Your Account | Replaceme Help",
  description:
    "How account closure works on Replaceme: grace period, anonymization, and what to resolve first.",
  alternates: { canonical: `${BASE_URL}/help/account/close-delete` },
  openGraph: {
    title: "Close or Delete Your Account | Replaceme Help",
    description:
      "Understand the 30-day grace period, anonymization, and legal retention after account closure.",
    url: `${BASE_URL}/help/account/close-delete`,
    type: "article",
  },
};

export default function CloseDeleteAccountHelpPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-8 md:py-12 lg:py-16">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/help"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#006e2f] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Help Center
        </Link>

        <header className="mb-8 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-800">
            <Trash2 size={13} className="shrink-0 text-[#006e2f]" aria-hidden />
            Trust &amp; Safety
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            Close or delete your account
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
            You can request account closure from settings or by emailing support. Here is what
            happens next.
          </p>
        </header>

        <article className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <section className="space-y-3 text-base leading-relaxed text-slate-600">
            <h2 className="text-lg font-bold text-slate-900">Resolve active work first</h2>
            <p>
              Before closing, end or settle open contracts, withdraw pending applications, close or
              archive active job posts, and settle outstanding billing. Creating a new account to
              evade suspension or unpaid obligations is not allowed.
            </p>
          </section>

          <section className="space-y-3 text-base leading-relaxed text-slate-600">
            <h2 className="text-lg font-bold text-slate-900">Grace period &amp; anonymization</h2>
            <p>
              After a deletion request is accepted, we keep a recovery window of{" "}
              <strong className="text-slate-800">
                {ACCOUNT_LIFECYCLE_TIMELINES.deletionGraceCalendarDays} calendar days
              </strong>
              . When that window ends, we anonymize or erase Platform-held personal data that is no
              longer needed. {DELETION_REQUEST_SLA}
            </p>
          </section>

          <section className="space-y-3 text-base leading-relaxed text-slate-600">
            <h2 className="text-lg font-bold text-slate-900">What we may still keep</h2>
            <p>
              Billing ledger and invoices may be retained for up to{" "}
              {ACCOUNT_LIFECYCLE_TIMELINES.billingRetainYears} years where tax or accounting law
              requires. Data an Employer already unlocked is controlled by that Employer—see the{" "}
              <Link href="/employer-dpa" className="font-semibold text-[#006e2f] hover:underline">
                Employer DPA
              </Link>
              . Full retention details:{" "}
              <Link
                href="/privacy-policy#9-retention"
                className="font-semibold text-[#006e2f] hover:underline"
              >
                Privacy Policy §9
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3 text-base leading-relaxed text-slate-600">
            <h2 className="text-lg font-bold text-slate-900">Need help?</h2>
            <p>
              Contact{" "}
              <a
                href={`mailto:${DELETION_REQUEST_SUPPORT_EMAIL}`}
                className="font-semibold text-[#006e2f] hover:underline"
              >
                {DELETION_REQUEST_SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
