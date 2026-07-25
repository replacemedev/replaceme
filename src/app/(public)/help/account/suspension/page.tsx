import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import {
  ACCOUNT_LIFECYCLE_TIMELINES,
  APPEAL_SLA_COPY,
  DELETION_REQUEST_SUPPORT_EMAIL,
} from "@/lib/data/legal";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Account Suspension | Replaceme Help",
  description:
    "What account suspension means on Replaceme, how long it lasts, and how to appeal.",
  alternates: { canonical: `${BASE_URL}/help/account/suspension` },
  openGraph: {
    title: "Account Suspension | Replaceme Help",
    description:
      "Understand suspension duration tiers, email notices, and appeal timelines.",
    url: `${BASE_URL}/help/account/suspension`,
    type: "article",
  },
};

export default function AccountSuspensionHelpPage() {
  const tiers = [
    ...ACCOUNT_LIFECYCLE_TIMELINES.suspendOptionsDays.map((d) => `${d} days`),
    ...(ACCOUNT_LIFECYCLE_TIMELINES.suspendIndefiniteAllowed
      ? ["indefinite"]
      : []),
  ].join(", ");

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
            <Lock size={13} className="shrink-0 text-[#006e2f]" aria-hidden />
            Trust &amp; Safety
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            Account suspension
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
            Suspension restricts access so we can review Terms violations, verification issues, or
            security risks. It is not the same as deleting your account.
          </p>
        </header>

        <article className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <section className="space-y-3 text-base leading-relaxed text-slate-600">
            <h2 className="text-lg font-bold text-slate-900">How long can a suspension last?</h2>
            <p>
              Timed suspensions use these duration tiers: <strong className="text-slate-800">{tiers}</strong>.
              The default timed suspension is{" "}
              <strong className="text-slate-800">
                {ACCOUNT_LIFECYCLE_TIMELINES.suspendDefaultDays} days
              </strong>
              , unless we tell you otherwise. When a timed suspension applies, we email the account
              contact with the end date.
            </p>
          </section>

          <section className="space-y-3 text-base leading-relaxed text-slate-600">
            <h2 className="text-lg font-bold text-slate-900">Suspension vs deletion</h2>
            <p>
              While suspended, your data generally stays on file, but login and marketplace features
              may be blocked. Closing or deleting an account is a separate process with a{" "}
              {ACCOUNT_LIFECYCLE_TIMELINES.deletionGraceCalendarDays}-day grace period before
              anonymization. See{" "}
              <Link
                href="/help/account/close-delete"
                className="font-semibold text-[#006e2f] hover:underline"
              >
                Close or delete your account
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3 text-base leading-relaxed text-slate-600">
            <h2 className="text-lg font-bold text-slate-900">How to appeal</h2>
            <p>
              Email{" "}
              <a
                href={`mailto:${DELETION_REQUEST_SUPPORT_EMAIL}`}
                className="font-semibold text-[#006e2f] hover:underline"
              >
                {DELETION_REQUEST_SUPPORT_EMAIL}
              </a>{" "}
              with the subject &quot;Account Appeal.&quot; {APPEAL_SLA_COPY} For Platform transaction
              disputes, also see{" "}
              <Link
                href="/terms-of-service#10-dispute-resolution"
                className="font-semibold text-[#006e2f] hover:underline"
              >
                Terms §10 (RA 11967 redress)
              </Link>
              .
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
