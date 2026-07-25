import Link from "next/link";
import { Briefcase, Check, Shield } from "lucide-react";
import { ACCOUNT_LIFECYCLE_TIMELINES } from "@/lib/data/legal";
import { LegalSectionHeading } from "./LegalSectionHeading";

const tocItems = [
  { href: "#1-parties", label: "1. Parties & Roles" },
  { href: "#2-scope", label: "2. Scope of Processing" },
  { href: "#3-employer-pic", label: "3. Employer as PIC" },
  { href: "#4-instructions", label: "4. Permitted Uses" },
  { href: "#5-security", label: "5. Security" },
  { href: "#6-subprocessors", label: "6. Subprocessors" },
  { href: "#7-retention", label: "7. Retention & Deletion" },
  { href: "#8-assistance", label: "8. Assistance & Rights" },
  { href: "#9-contact", label: "9. Contact" },
];

function CheckItem({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-base leading-relaxed text-slate-600 sm:text-[17px]">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
      </span>
      <span>
        {label ? <strong className="font-semibold text-slate-800">{label} </strong> : null}
        {children}
      </span>
    </li>
  );
}

export function EmployerDpaContent({
  hideSidebar = false,
}: {
  hideSidebar?: boolean;
}) {
  const articleContent = (
    <article
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 lg:p-10 ${
        hideSidebar ? "" : "order-1 lg:order-2"
      }`}
    >
      <div className="mb-10 rounded-xl border border-slate-100 bg-slate-50 p-5 sm:p-6">
        <h2 className="mb-3 flex items-center gap-2 font-bold text-[#22c55e]">
          <Shield className="h-4 w-4 shrink-0" aria-hidden />
          Employer Data Processing &amp; Sharing Terms
        </h2>
        <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
          These terms explain how Replaceme and Employers handle Worker personal data when an
          Employer unlocks a profile, receives an application, or messages a Worker. They supplement
          our{" "}
          <Link href="/privacy-policy" className="font-semibold text-[#006e2f] hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms-of-service" className="font-semibold text-[#006e2f] hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </div>

      <LegalSectionHeading id="1-parties" number={1} title="Parties & Roles" />
      <p className="mb-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        Replaceme operates the marketplace and acts as Personal Information Controller for Platform
        accounts, verification, and billing. When an Employer receives identifiable Worker data
        through unlock, apply, or messaging, the Employer becomes an independent Personal Information
        Controller for that shared data under RA 10173 (and a controller under GDPR where applicable).
      </p>

      <LegalSectionHeading id="2-scope" number={2} title="Scope of Processing" />
      <ul className="mb-4 space-y-3">
        <CheckItem label="Shared Worker data may include:">
          name, contact details, professional profile, resume, skills, location (region/city), and
          verification status. Government ID images and statutory identifiers are{" "}
          <strong className="font-semibold text-slate-800">not</strong> shared with Employers by
          default.
        </CheckItem>
        <CheckItem label="Employer account data:">
          company profile, representative name, work email, phone, country, and billing metadata
          processed by Replaceme and Stripe.
        </CheckItem>
      </ul>

      <LegalSectionHeading id="3-employer-pic" number={3} title="Employer Obligations as PIC" />
      <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-5 sm:p-6">
        <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
          <Briefcase className="h-4 w-4 shrink-0 text-[#22c55e]" aria-hidden />
          After unlock or application
        </h3>
        <ul className="space-y-3">
          <CheckItem>
            Use Worker data only for evaluating candidates and hiring-related communication.
          </CheckItem>
          <CheckItem>
            Do not resell, scrape, bulk-export, or use Worker contact details for unrelated marketing.
          </CheckItem>
          <CheckItem>
            Apply appropriate security measures and honor data subject requests directed to you.
          </CheckItem>
          <CheckItem>
            Comply with RA 10173, and GDPR/CCPA where those laws apply to your organization.
          </CheckItem>
        </ul>
      </div>

      <LegalSectionHeading id="4-instructions" number={4} title="Permitted Uses" />
      <p className="mb-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        Employers may process shared Worker data to review applications, schedule interviews, and
        make hiring decisions. Any secondary purpose requires a separate lawful basis and, where
        required, the Worker&apos;s consent.
      </p>

      <LegalSectionHeading id="5-security" number={5} title="Security" />
      <p className="mb-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        Replaceme protects Platform-held data with encryption in transit, access controls, and vendor
        diligence. Employers must protect downloaded or copied Worker data with equivalent safeguards
        and limit access to personnel with a need to know.
      </p>

      <LegalSectionHeading id="6-subprocessors" number={6} title="Subprocessors" />
      <p className="mb-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        Replaceme uses infrastructure and payment processors (including hosting providers and Stripe)
        under contracts that require confidentiality and security. The current public list is at{" "}
        <Link href="/subprocessors" className="font-semibold text-[#006e2f] hover:underline">
          /subprocessors
        </Link>
        .
      </p>

      <LegalSectionHeading id="7-retention" number={7} title="Retention & Deletion" />
      <p className="mb-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        On the Platform, when a Worker or Employer account is closed, Replaceme observes a{" "}
        {ACCOUNT_LIFECYCLE_TIMELINES.deletionGraceCalendarDays}-day grace period and then anonymizes
        or erases Platform-held personal data that is no longer needed, subject to legal retention.
        Employers should retain unlocked Worker data only as long as needed for the hiring process or
        legal obligations, then securely delete or anonymize it. The Employer remains the Personal
        Information Controller for any unlocked copies they have downloaded or exported. Workers may
        request erasure from Replaceme via account settings or email; requests about data held solely
        by an Employer after unlock should be directed primarily to that Employer.
      </p>

      <LegalSectionHeading id="8-assistance" number={8} title="Assistance & Rights" />
      <p className="mb-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        Replaceme will reasonably assist Employers responding to data subject requests that involve
        Platform-held records. Nothing in these terms transfers Employer liability for misuse of
        Worker data after it has been unlocked or exported by the Employer.
      </p>

      <LegalSectionHeading id="9-contact" number={9} title="Contact" />
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 text-center text-base leading-relaxed text-slate-700 sm:px-6 sm:py-5 sm:text-[17px]">
        <p>
          Privacy and DPA inquiries:{" "}
          <a
            href="mailto:support@replaceme.ph"
            className="font-semibold text-[#22c55e] underline underline-offset-2 hover:text-[#16a34a]"
          >
            support@replaceme.ph
          </a>
        </p>
      </div>
    </article>
  );

  if (hideSidebar) {
    return articleContent;
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
      <aside className="order-2 lg:sticky lg:top-28 lg:order-1 lg:self-start">
        <nav aria-label="DPA table of contents" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            On this page
          </p>
          <ul className="space-y-2">
            {tocItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block text-sm font-medium text-slate-600 transition-colors hover:text-[#006e2f]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {articleContent}
    </div>
  );
}
