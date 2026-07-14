import Link from "next/link";
import { Briefcase, Check, Shield, User } from "lucide-react";
import { LegalSectionHeading } from "./LegalSectionHeading";

const tocItems = [
  { href: "#1-controller", label: "1. Who We Are" },
  { href: "#2-scope", label: "2. Scope & Dual Roles" },
  { href: "#3-worker-data", label: "3. Worker Data (RA 10173)" },
  { href: "#4-employer-data", label: "4. Employer Data" },
  { href: "#5-purposes", label: "5. Purposes & Legal Bases" },
  { href: "#6-sharing", label: "6. Sharing & PIC Obligations" },
  { href: "#7-payment-data", label: "7. Payment Data & Cross-Border" },
  { href: "#8-cross-border", label: "8. Cross-Border Transfers" },
  { href: "#9-retention", label: "9. Retention & Security" },
  { href: "#10-breach", label: "10. Breach Notification (NPC 2026-02)" },
  { href: "#11-rights", label: "11. Your Rights" },
  { href: "#12-cookies", label: "12. Cookies" },
  { href: "#13-children", label: "13. Children" },
  { href: "#14-changes", label: "14. Changes" },
  { href: "#15-contact", label: "15. Contact" },
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

function RolePanel({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: typeof User;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className="scroll-mt-28 rounded-xl border border-slate-100 bg-slate-50 p-5 sm:p-6"
    >
      <h3 className="mb-3 flex items-center gap-2.5 font-bold text-slate-900">
        <Icon className="h-4 w-4 shrink-0 text-[#22c55e]" aria-hidden />
        {title}
      </h3>
      {children}
    </div>
  );
}

export function PrivacyPolicyContent({
  hideSidebar = false,
  isModal = false,
}: {
  hideSidebar?: boolean;
  isModal?: boolean;
}) {
  const articleContent = (
    <article
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 ${
        isModal ? "md:p-10" : "lg:p-10"
      } ${hideSidebar ? "" : isModal ? "order-1 md:order-2" : "order-1 lg:order-2"}`}
    >
      <div className="mb-10 rounded-xl border border-slate-100 bg-slate-50 p-5 sm:p-6">
        <h2 className="mb-3 flex items-center gap-2 font-bold text-[#22c55e]">
          <Shield className="h-4 w-4 shrink-0" aria-hidden />
          Summary
        </h2>
        <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
          Replaceme protects personal data under the Philippine Data Privacy Act of 2012 (Republic
          Act No. 10173) and its IRR, NPC circulars and advisories, and—where applicable—the EU/UK
          GDPR and California CCPA/CPRA for international visitors and Employers. This Policy
          explains what we collect from Workers and Employers, how we use it, how Stripe handles
          payment credentials (PCI), when data leaves your home country, when Employers become
          separate controllers of Worker data, and how we notify breaches within NPC timelines.
        </p>
      </div>

      <LegalSectionHeading id="1-controller" number={1} title="Who We Are (Personal Information Controller)" />
      <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
        For Platform account administration, verification, billing orchestration, security, and
        marketplace operations, Replaceme acts as a Personal Information Controller (PIC) under RA
        10173 (and as a controller under GDPR where that law applies). Our website is{" "}
        <Link href="https://replaceme.ph" className="font-semibold text-[#006e2f] hover:underline">
          https://replaceme.ph
        </Link>
        . Privacy inquiries:{" "}
        <a href="mailto:support@replaceme.ph" className="font-semibold text-[#006e2f] hover:underline">
          support@replaceme.ph
        </a>
        .
      </p>

      <LegalSectionHeading id="2-scope" number={2} title="Scope & Dual-Sided Marketplace" />
      <p className="mb-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        This Policy covers Workers (typically Filipino residents offering services) and Employers
        (local or global companies hiring through Replaceme). It applies to website visitors,
        applicants, and account holders. Separately negotiated contracts (for example, enterprise
        DPAs) may supplement this Policy.
      </p>

      <LegalSectionHeading
        id="3-worker-data"
        number={3}
        title="Worker Personal Data (Philippines — RA 10173)"
      />
      <RolePanel id="worker-data-detail" icon={User} title="What we collect from Workers">
        <ul className="space-y-3">
          <CheckItem label="Account & identity:">
            name, email, phone, username, password hashes, and government ID images/numbers submitted
            for RA 11967 listing verification (e.g., PhilID, Passport, Driver&apos;s License).
          </CheckItem>
          <CheckItem label="Sensitive Personal Information (SPI):">
            where provided or required for verification or compliance—government-issued ID numbers
            and document images, birth date, and (if you choose to provide it) civil status or other
            SPI as defined under RA 10173. We process SPI only with appropriate legal basis,
            heightened safeguards, and limited access.
          </CheckItem>
          <CheckItem label="Professional profile:">
            resume/CV, skills, work history, education, portfolio links, preferred rates,
            availability, and application materials.
          </CheckItem>
          <CheckItem label="Tax / regulatory:">
            TIN and BIR registration evidence when required under BIR RR 15-2024 for listed online
            service providers.
          </CheckItem>
          <CheckItem label="Usage & device:">
            IP address, device/browser data, logs, and approximate location derived from IP for
            security and fraud prevention.
          </CheckItem>
        </ul>
      </RolePanel>

      <LegalSectionHeading id="4-employer-data" number={4} title="Employer Business & Billing Data" />
      <RolePanel id="employer-data-detail" icon={Briefcase} title="What we collect from Employers">
        <ul className="space-y-3">
          <CheckItem label="Company profile:">
            legal/trade name, industry, company size, website, logo, and job post content.
          </CheckItem>
          <CheckItem label="Representatives:">
            name, work email, phone, role/title, and authentication data for hiring managers and
            billing contacts.
          </CheckItem>
          <CheckItem label="Financial / billing:">
            subscription tier, invoices, payment status, and billing contact details. Full payment
            card numbers, expiration dates, and CVV/CVC codes are{" "}
            <strong className="font-semibold text-slate-800">not</strong> collected or stored on
            Replaceme servers; they are transmitted directly to and vaulted by{" "}
            <strong className="font-semibold text-slate-800">Stripe</strong>. See Section 7.
          </CheckItem>
          <CheckItem label="Hiring activity:">
            jobs posted, candidates viewed/unlocked, messages, interview notes you enter, and
            plan-usage metrics.
          </CheckItem>
        </ul>
      </RolePanel>

      <LegalSectionHeading id="5-purposes" number={5} title="Purposes & Legal Bases" />
      <ul className="mb-4 space-y-3">
        <CheckItem label="Contract / service delivery:">
          create accounts, match Workers and Employers, enable messaging, and administer
          subscriptions.
        </CheckItem>
        <CheckItem label="Legal obligation:">
          identity listing rules under RA 11967; tax-platform duties under BIR RR 15-2024; respond to
          lawful orders; NPC breach reporting.
        </CheckItem>
        <CheckItem label="Consent:">
          optional analytics/marketing cookies (see Cookie Policy); certain marketing emails (with
          unsubscribe).
        </CheckItem>
        <CheckItem label="Legitimate interests (balanced):">
          security, fraud prevention, product improvement using aggregated metrics, and enforcing
          Terms—where consent is not required and rights are not overridden.
        </CheckItem>
      </ul>

      <LegalSectionHeading
        id="6-sharing"
        number={6}
        title="Data Sharing & Employer Responsibility (Critical)"
      />
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>We do not sell personal data. We share data only as needed to operate the marketplace:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-semibold text-slate-800">With Employers:</strong> anonymous
            previews on Discovery; full name, contact details, resume, and profile fields when an
            Employer&apos;s plan unlocks or a Worker applies / consents to share;
          </li>
          <li>
            <strong className="font-semibold text-slate-800">Processors:</strong> hosting (e.g.,
            cloud infrastructure), email delivery, customer support tools, analytics (only with
            consent), and Stripe for payments;
          </li>
          <li>
            <strong className="font-semibold text-slate-800">Authorities:</strong> when required by
            law, regulation, or valid legal process (DTI, NPC, BIR, courts, law enforcement).
          </li>
        </ul>
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
          <p className="font-semibold text-slate-900">When an Employer unlocks Worker data</p>
          <p className="mt-2">
            Once an Employer unlocks or otherwise receives a Worker&apos;s full profile—including
            contact details, resume, and government or tax identifiers if shared—the Employer
            becomes a <strong className="font-semibold text-slate-800">separate Personal Information Controller (PIC)</strong>{" "}
            and/or Processor under RA 10173 (and a controller/processor under GDPR/CCPA where those
            laws apply) for that data. The Employer must:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Use the data only for legitimate hiring related to the opportunity;</li>
            <li>
              Implement appropriate organizational and technical security measures;
            </li>
            <li>
              Honor data-subject rights requests directed to them regarding data they control; and
            </li>
            <li>
              Not resell, scrape, or use Worker contact information for unrelated marketing or
              unlawful surveillance.
            </li>
          </ul>
          <p className="mt-3">
            Replaceme remains PIC for Platform-held copies but is not responsible for an
            Employer&apos;s independent misuse after unlock, except to the extent required by law or
            our ability to suspend abusing accounts.
          </p>
        </div>
      </div>

      <LegalSectionHeading
        id="7-payment-data"
        number={7}
        title="Payment Information, Data Sharing, and Cross-Border Transfers"
      />
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <h3
          id="71-pci"
          className="scroll-mt-28 text-base font-bold text-slate-900 sm:text-lg"
        >
          7.1 PCI-DSS Compliance &amp; Card Data Storage
        </h3>
        <p>
          Replaceme{" "}
          <strong className="font-semibold text-slate-800">
            does not collect, process, or store full credit or debit card numbers, card expiration
            dates, or CVV/CVC security codes on our servers
          </strong>
          . All sensitive payment credentials are entered by you directly into Stripe-hosted Checkout
          or Elements interfaces and are transmitted to and vaulted by Stripe under Stripe&apos;s PCI
          DSS–compliant infrastructure. Replaceme may receive limited payment metadata only (for
          example, Stripe customer ID, payment method brand/last four digits, invoice status,
          subscription status, and dispute status) necessary to provision entitlements, display
          billing history, and prevent fraud.
        </p>

        <h3
          id="72-sharing-stripe"
          className="scroll-mt-28 text-base font-bold text-slate-900 sm:text-lg"
        >
          7.2 Data Sharing with Stripe &amp; Cross-Border Transfers
        </h3>
        <p>
          To facilitate payments, prevent fraud, manage subscriptions, issue invoices, and handle
          chargebacks, we share necessary personal and business data with Stripe—including name,
          email address, billing address, company details, tax identifiers where provided, and
          transaction history. The primary lawful basis for this sharing under the Philippine Data
          Privacy Act of 2012 (RA 10173) and, where applicable, the GDPR is{" "}
          <strong className="font-semibold text-slate-800">contractual necessity</strong> (performance
          of the subscription contract and related payment obligations). Additional bases may include
          legal obligation (tax, AML, and dispute-handling rules) and legitimate interests in
          securing the Platform against fraud, balanced against your rights.
        </p>
        <p>
          Because Replaceme serves international Employers worldwide, payment-related and account
          data may be{" "}
          <strong className="font-semibold text-slate-800">
            transferred to and processed on servers located outside your home country
          </strong>
          —including in the United States, the European Union / European Economic Area, the United
          Kingdom, Singapore, and other regions where Stripe or its sub-processors operate—under the
          same contractual-necessity basis and subject to the safeguards below.
        </p>

        <h3
          id="73-global-privacy"
          className="scroll-mt-28 text-base font-bold text-slate-900 sm:text-lg"
        >
          7.3 Global Privacy Compliance (RA 10173, GDPR, CCPA)
        </h3>
        <p>
          This payment data sharing complies with the Philippine Data Privacy Act of 2012 (RA 10173)
          and its IRR. Stripe acts as a legitimate third-party Personal Information Processor (and,
          under GDPR terminology, a data processor) bound by Stripe&apos;s{" "}
          <a
            href="https://stripe.com/legal/dpa"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#006e2f] hover:underline"
          >
            Data Processing Agreement
          </a>
          , which incorporates the{" "}
          <a
            href="https://stripe.com/legal/dta"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#006e2f] hover:underline"
          >
            Data Transfers Addendum
          </a>
          . Cross-border transfers to Stripe, LLC in the United States rely on internationally
          recognized transfer mechanisms, including the EU-U.S. Data Privacy Framework where
          available and the European Commission&apos;s Standard Contractual Clauses (SCCs), together
          with the UK International Data Transfer Addendum where UK GDPR applies.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-semibold text-slate-800">GDPR:</strong> Where we process personal
            data of individuals in the EEA/UK, payment processing by Stripe is conducted under
            Article 28 processor terms and Article 46 transfer safeguards (SCCs / DPF) as described
            in Stripe&apos;s DPA.
          </li>
          <li>
            <strong className="font-semibold text-slate-800">CCPA/CPRA:</strong> Stripe certifies, in
            its processor capacity, that it does not sell or share personal information as those
            terms are defined under California law except as permitted to provide the payment
            services. Replaceme does not sell Employer or Worker personal information.
          </li>
          <li>
            <strong className="font-semibold text-slate-800">Your choices:</strong> You may update
            billing contacts and payment methods via the Stripe Customer Portal. Card-detail
            corrections and deletion of vaulted PAN data are handled by Stripe as the card vault
            operator; contact us at{" "}
            <a
              href="mailto:support@replaceme.ph"
              className="font-semibold text-[#006e2f] hover:underline"
            >
              support@replaceme.ph
            </a>{" "}
            and we will coordinate deletion or restriction requests consistent with retention needed
            for invoices, tax, and dispute defense.
          </li>
        </ul>
      </div>

      <LegalSectionHeading id="8-cross-border" number={8} title="Cross-Border & B2B Transfers" />
      <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
        Apart from payment processing described in Section 7, Worker data may be accessed by
        Employers and service providers outside the Philippines, including in the United States,
        EU/EEA, UK, Singapore, and other regions. We implement appropriate safeguards consistent with
        RA 10173 / NPC rules and, for GDPR-covered transfers, mechanisms such as Standard Contractual
        Clauses or adequacy decisions where available. US Employers handling California residents&apos;
        data must also meet CCPA/CPRA business obligations. Employers receiving Filipino Worker data
        must ensure their own cross-border compliance programs.
      </p>

      <LegalSectionHeading id="9-retention" number={9} title="Retention & Security" />
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>
          We retain account and verification data for as long as your account is active and for a
          reasonable period thereafter to meet legal, tax, dispute, and security obligations
          (typically up to the longer of applicable statutory periods or our documented retention
          schedules). Billing metadata and invoices may be retained for longer where tax or
          accounting law requires. Resume and application data may be retained while relevant to open
          roles or your profile settings. We use encryption in transit, access controls, logging, and
          vendor diligence. No method of transmission or storage is 100% secure.
        </p>
      </div>

      <LegalSectionHeading
        id="10-breach"
        number={10}
        title="Personal Data Breach Notification (NPC Advisory 2026-02)"
      />
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>
          Replaceme maintains a personal data breach management process aligned with{" "}
          <strong className="font-semibold text-slate-800">NPC Circular No. 16-03</strong> and{" "}
          <strong className="font-semibold text-slate-800">NPC Advisory No. 2026-02</strong>. Where
          a personal data breach is notifiable:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            We will notify the National Privacy Commission within{" "}
            <strong className="font-semibold text-slate-800">seventy-two (72) hours</strong> of
            knowledge or reasonable belief that a personal data breach has occurred, based on
            available information;
          </li>
          <li>
            We will submit the{" "}
            <strong className="font-semibold text-slate-800">full breach report within five (5) days</strong>{" "}
            of discovery, in strict adherence to NPC Circular 16-03 as clarified by NPC Advisory
            2026-02—filing postponement, exemption, or alternative-notification requests through the
            DBNMS does <strong className="font-semibold text-slate-800">not</strong> suspend this
            five-day full-report deadline unless the NPC expressly grants additional time in writing;
            and
          </li>
          <li>
            We will notify affected data subjects within the prescribed periods when required,
            providing information needed to mitigate harm.
          </li>
        </ul>
        <p>
          If you believe your account or data has been compromised, contact{" "}
          <a href="mailto:support@replaceme.ph" className="font-semibold text-[#006e2f] hover:underline">
            support@replaceme.ph
          </a>{" "}
          immediately.
        </p>
      </div>

      <LegalSectionHeading id="11-rights" number={11} title="Rights of the Data Subject" />
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>
          Under <strong className="font-semibold text-slate-800">RA 10173</strong>, you have the
          rights to be informed, to object, to access, to correct (rectification), to erasure or
          blocking, to data portability (where applicable), to file a complaint with the NPC, and to
          damages for violations of your rights. EU/UK GDPR rights (access, rectification, erasure,
          restriction, objection, portability, withdraw consent) and CCPA/CPRA rights (know, delete,
          correct, opt-out of sale/share, non-discrimination) apply to eligible individuals.
        </p>
        <p>
          To exercise rights against Replaceme as PIC, email{" "}
          <a href="mailto:support@replaceme.ph" className="font-semibold text-[#006e2f] hover:underline">
            support@replaceme.ph
          </a>
          . We may need to verify your identity. Requests relating to data controlled solely by an
          Employer after unlock should be directed primarily to that Employer; we will assist where
          feasible.
        </p>
      </div>

      <LegalSectionHeading id="12-cookies" number={12} title="Cookies & Similar Technologies" />
      <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
        We use strictly necessary cookies to operate the Platform. Analytics and marketing cookies
        require prior opt-in consent consistent with NPC Circular No. 2023-04 (Guidelines on Consent)
        and GDPR. Details are in our{" "}
        <Link href="/cookie-policy" className="font-semibold text-[#006e2f] hover:underline">
          Cookie Policy
        </Link>
        .
      </p>

      <LegalSectionHeading id="13-children" number={13} title="Children" />
      <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
        The Platform is not directed to individuals under 18. We do not knowingly collect personal
        data from children. If you believe a minor has provided data, contact us for deletion.
      </p>

      <LegalSectionHeading id="14-changes" number={14} title="Changes to This Policy" />
      <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
        We may update this Policy to reflect legal or operational changes (including NPC advisories
        and international privacy laws). We will revise the &quot;Last Updated&quot; date and provide
        additional notice when changes are material.
      </p>

      <LegalSectionHeading id="15-contact" number={15} title="Contact" />
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 text-center text-base leading-relaxed text-slate-700 sm:px-6 sm:py-5 sm:text-[17px]">
        <p>
          For privacy requests and general support:{" "}
          <a
            href="mailto:support@replaceme.ph"
            className="font-semibold text-[#22c55e] underline underline-offset-2 hover:text-[#16a34a]"
          >
            support@replaceme.ph
          </a>
        </p>
        <p className="mt-2 text-sm text-slate-500">
          You may also lodge a complaint with the National Privacy Commission (privacy.gov.ph) or
          your local supervisory authority.
        </p>
      </div>
    </article>
  );

  if (hideSidebar) {
    return articleContent;
  }

  const gridClasses = isModal
    ? "grid grid-cols-1 items-start gap-6 md:grid-cols-[240px_minmax(0,1fr)] md:gap-8"
    : "grid grid-cols-1 items-start gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10";

  const asideClasses = isModal
    ? "order-2 self-start md:sticky md:top-4 md:order-1 w-full"
    : "order-2 self-start lg:sticky lg:top-28 lg:order-1";

  const listMaxHeightClass = isModal ? "max-h-[50vh]" : "max-h-[70vh]";

  return (
    <div className={gridClasses}>
      <aside className={asideClasses}>
        <nav
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
          aria-label="Table of contents"
        >
          <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Contents
          </p>
          <ol className={`${listMaxHeightClass} space-y-2.5 overflow-y-auto text-sm`}>
            {tocItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="leading-snug text-slate-600 transition-colors hover:text-[#22c55e]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </aside>
      {articleContent}
    </div>
  );
}
