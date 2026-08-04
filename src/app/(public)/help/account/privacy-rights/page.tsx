import type { Metadata } from "next";
import Link from "next/link";
import {
  APPEAL_SLA_COPY,
  DELETION_REQUEST_SLA,
  DELETION_REQUEST_SUPPORT_EMAIL,
} from "@/lib/data/legal";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Your Privacy Rights | Help",
  description:
    "How to exercise access, erasure, portability, and other privacy rights on Replaceme.",
  alternates: { canonical: `${BASE_URL}/help/account/privacy-rights` },
  openGraph: {
    title: "Your Privacy Rights | Replaceme Help",
    description:
      "RA 10173 and international privacy rights: deletion, portability, and where to ask for help.",
    url: `${BASE_URL}/help/account/privacy-rights`,
    type: "article",
  },
};

export default function PrivacyRightsHelpPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-6 sm:py-8 md:py-12 lg:py-16">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 max-w-2xl">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            Your privacy rights
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
            Under the Philippine Data Privacy Act (RA 10173) and GDPR/CCPA where they apply. You can
            ask about, correct, or erase personal data Replaceme holds as controller.
          </p>
        </header>

        <article className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <section className="space-y-3 text-base leading-relaxed text-slate-600">
            <h2 className="text-lg font-bold text-slate-900">Erasure / account closure</h2>
            <p>
              Email{" "}
              <a
                href={`mailto:${DELETION_REQUEST_SUPPORT_EMAIL}?subject=Account%20deletion%20request`}
                className="font-semibold text-[#006e2f] hover:underline"
              >
                {DELETION_REQUEST_SUPPORT_EMAIL}
              </a>{" "}
              or use the delete option in account settings. {DELETION_REQUEST_SLA} See{" "}
              <Link
                href="/help/account/close-delete"
                className="font-semibold text-[#006e2f] hover:underline"
              >
                Close or delete your account
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy#6-retention"
                className="font-semibold text-[#006e2f] hover:underline"
              >
                Privacy Policy. Retention
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3 text-base leading-relaxed text-slate-600">
            <h2 className="text-lg font-bold text-slate-900">Portability (structured export)</h2>
            <p>
              In this version of the Platform, email{" "}
              <a
                href={`mailto:${DELETION_REQUEST_SUPPORT_EMAIL}`}
                className="font-semibold text-[#006e2f] hover:underline"
              >
                {DELETION_REQUEST_SUPPORT_EMAIL}
              </a>{" "}
              to request a structured export of account data we hold as Personal Information
              Controller. We may need to verify your identity first.
            </p>
          </section>

          <section className="space-y-3 text-base leading-relaxed text-slate-600">
            <h2 className="text-lg font-bold text-slate-900">Appeals</h2>
            <p>
              {APPEAL_SLA_COPY} Full rights language:{" "}
              <Link
                href="/privacy-policy#7-your-rights"
                className="font-semibold text-[#006e2f] hover:underline"
              >
                Privacy Policy. Your Rights
              </Link>
              .
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
