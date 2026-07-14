import Link from "next/link";
import { Briefcase, Scale, User } from "lucide-react";
import { LegalSectionHeading } from "./LegalSectionHeading";

const tocItems = [
  { href: "#1-acceptance-of-terms", label: "1. Acceptance of Terms" },
  { href: "#2-platform-role", label: "2. Platform Role" },
  { href: "#3-eligibility-accounts", label: "3. Eligibility & Accounts" },
  { href: "#4-workers", label: "4. Workers (Philippines)" },
  { href: "#41-id-verification", label: "4.1 ID Verification (RA 11967)", indent: true },
  { href: "#42-bir-tax", label: "4.2 BIR & Tax (RR 15-2024)", indent: true },
  { href: "#5-employers", label: "5. Employers (Global & Local)" },
  { href: "#51-subscriptions", label: "5.1 Subscriptions & Billing", indent: true },
  { href: "#52-extraterritoriality", label: "5.2 Extraterritoriality", indent: true },
  { href: "#53-employer-obligations", label: "5.3 Employer Obligations", indent: true },
  { href: "#54-non-circumvention", label: "5.4 Non-Circumvention", indent: true },
  { href: "#6-payments", label: "6. Billing, Subscriptions & Payments" },
  { href: "#61-stripe-processor", label: "6.1 Global Payment Processor", indent: true },
  { href: "#62-currency-taxes", label: "6.2 Currency, FX & Taxes", indent: true },
  { href: "#63-auto-renewal", label: "6.3 Auto-Renewal", indent: true },
  { href: "#64-plan-changes", label: "6.4 Upgrades, Downgrades & Proration", indent: true },
  { href: "#65-refunds-chargebacks", label: "6.5 Refunds & Chargebacks", indent: true },
  { href: "#66-billing-redress", label: "6.6 Billing Dispute Redress", indent: true },
  { href: "#7-acceptable-use", label: "7. Acceptable Use" },
  { href: "#8-intellectual-property", label: "8. Intellectual Property" },
  { href: "#9-disclaimers", label: "9. Disclaimers" },
  { href: "#10-limitation-of-liability", label: "10. Limitation of Liability" },
  { href: "#11-indemnification", label: "11. Indemnification" },
  { href: "#12-dispute-resolution", label: "12. Internal Redress (RA 11967)" },
  { href: "#13-termination", label: "13. Suspension & Termination" },
  { href: "#14-governing-law", label: "14. Governing Law" },
  { href: "#15-changes", label: "15. Changes to These Terms" },
  { href: "#16-contact", label: "16. Contact & Support" },
];

function RoleCard({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: typeof Briefcase;
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

export function TermsOfServiceContent({ hideSidebar = false }: { hideSidebar?: boolean }) {
  const articleContent = (
    <article
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 lg:p-10 ${hideSidebar ? "" : "order-1 lg:order-2"}`}
    >
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>
          Welcome to Replaceme (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or
          &quot;us&quot;). These Terms and Conditions (&quot;Terms&quot;) govern your access to
          and use of{" "}
          <Link href="https://replaceme.ph" className="font-semibold text-[#006e2f] hover:underline">
            replaceme.ph
          </Link>
          , our mobile and web applications, and related services (collectively, the
          &quot;Platform&quot; or &quot;Services&quot;).
        </p>
        <p>
          Replaceme is a dual-sided digital marketplace connecting Filipino workers and independent
          contractors (&quot;Workers&quot;) with local and international employers
          (&quot;Employers&quot;). By creating an account, accessing, or using the Platform, you
          agree to these Terms and our{" "}
          <Link href="/privacy-policy" className="font-semibold text-[#006e2f] hover:underline">
            Privacy Policy
          </Link>
          . If you do not agree, do not use the Services.
        </p>
      </div>

      <LegalSectionHeading id="1-acceptance-of-terms" number={1} title="Acceptance of Terms" />
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>
          These Terms form a legally binding agreement between you and Replaceme. If you use the
          Platform on behalf of a company or other legal entity, you represent that you have
          authority to bind that entity, and &quot;you&quot; includes that entity.
        </p>
        <p>
          We may publish additional policies, product guidelines, and community standards. Those
          documents are incorporated by reference. Continued use after we post updates constitutes
          acceptance of the revised Terms, except where applicable law requires affirmative consent.
        </p>
      </div>

      <LegalSectionHeading
        id="2-platform-role"
        number={2}
        title="Platform Role as E-Marketplace / Intermediary"
      />
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>
          Replaceme operates as an <strong className="font-semibold text-slate-800">electronic marketplace and digital intermediary</strong> under the Internet Transactions Act of 2023
          (Republic Act No. 11967). We facilitate discovery, profile access, messaging, and hiring
          workflows between Workers and Employers. We are <strong className="font-semibold text-slate-800">not</strong> the employer of Workers listed on
          the Platform, nor a party to any employment, consultancy, or contractor agreement you
          enter with another user, unless we expressly agree in a separate written contract.
        </p>
        <p>
          Workers are generally engaged as independent contractors or employees of the hiring
          Employer (as the parties agree). Employers alone determine the nature of the engagement,
          compensation, working conditions, and compliance with applicable labor and tax laws.
        </p>
      </div>

      <LegalSectionHeading
        id="3-eligibility-accounts"
        number={3}
        title="Eligibility & Accounts"
      />
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>You must:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Be at least eighteen (18) years of age;</li>
          <li>Provide accurate, complete, and current registration information;</li>
          <li>Maintain the security of your credentials and notify us of unauthorized access; and</li>
          <li>
            Use the Platform only for lawful professional hiring and job-seeking purposes consistent
            with these Terms.
          </li>
        </ul>
        <p>
          You are responsible for all activity under your account. We may require identity,
          business, or tax documentation before unlocking listing, messaging, payout, or hiring
          features.
        </p>
      </div>

      <LegalSectionHeading
        id="4-workers"
        number={4}
        title="Workers Residing or Operating in the Philippines"
      />
      <p className="mb-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        This Section applies to Workers who reside in, operate from, or offer services through the
        Philippines via Replaceme.
      </p>

      <div className="mb-4 space-y-4">
        <RoleCard id="41-id-verification" icon={User} title="4.1 Mandatory ID Verification (RA 11967)">
          <div className="space-y-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            <p>
              As an e-marketplace under <strong className="font-semibold text-slate-800">Republic Act No. 11967</strong>, Replaceme
              requires Workers (as online merchants / service providers listed on the Platform) to
              submit identifying information <strong className="font-semibold text-slate-800">prior to listing</strong> or obtaining a
              publicly discoverable profile, including:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Full legal name matching government records;</li>
              <li>
                At least one (1) valid Philippine government-issued identification document (for
                example: PhilID / National ID, Philippine Passport, Driver&apos;s License, UMID,
                PRC ID, or other IDs we accept from time to time);
              </li>
              <li>Geographic address within the Philippines (or declared place of operations); and</li>
              <li>Valid mobile number and email address for contact and verification.</li>
            </ul>
            <p>
              We maintain and periodically update a register of listed Workers for compliance,
              transparency, and lawful requests by competent authorities. Failure or refusal to
              complete ID verification, or submission of forged / mismatched documents, will result
              in delayed listing, account restriction, suspension, or permanent removal from the
              Platform.
            </p>
          </div>
        </RoleCard>

        <RoleCard id="42-bir-tax" icon={Scale} title="4.2 BIR Registration & Tax Compliance (RR 15-2024)">
          <div className="space-y-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            <p>
              Workers who engage in trade or business through the Platform—including offering
              freelance, professional, or other compensated services—must register with the{" "}
              <strong className="font-semibold text-slate-800">Bureau of Internal Revenue (BIR)</strong> and comply with the National
              Internal Revenue Code and <strong className="font-semibold text-slate-800">Revenue Regulations No. 15-2024</strong>,
              including obtaining and maintaining a Taxpayer Identification Number (TIN) and, where
              required, displaying proof of BIR registration (COR / eCOR) in the manner prescribed
              by law.
            </p>
            <p>
              Replaceme may require Workers to submit evidence of BIR registration before continued
              listing, messaging, or other paid-marketplace features. Under RR 15-2024, digital
              platform and e-marketplace operators must ensure sellers / merchants on their platforms
              are duly registered; failure to enforce such mechanisms may expose the platform to
              administrative liability. Accordingly:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Unverified or unregistered Workers may be suspended, delisted, or taken down pending
                compliance;
              </li>
              <li>
                We may comply with BIR <strong className="font-semibold text-slate-800">Closure / Take Down Orders</strong> (which may
                remain effective for at least five (5) days or until registration requirements are
                satisfied); and
              </li>
              <li>
                Workers remain solely responsible for filing returns, issuing invoices / official
                receipts where required, and paying taxes on income earned through engagements
                arranged via the Platform.
              </li>
            </ul>
          </div>
        </RoleCard>
      </div>

      <div className="mb-4 space-y-3 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>Workers further agree to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Provide accurate skills, experience, portfolio, and availability information;</li>
          <li>
            Keep confidential any proprietary information shared by Employers during screening or
            interviews;
          </li>
          <li>Not use bots, scripts, or deceptive methods to apply for roles; and</li>
          <li>
            Honor commitments made to Employers once an engagement is accepted, subject to lawful
            withdrawal rights.
          </li>
        </ul>
      </div>

      <LegalSectionHeading
        id="5-employers"
        number={5}
        title="Employers — Global and Local Companies"
      />
      <p className="mb-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        This Section applies to Employers, hiring managers, and company representatives using
        Replaceme to recruit Filipino and other talent.
      </p>

      <div className="space-y-4">
        <RoleCard
          id="51-subscriptions"
          icon={Briefcase}
          title="5.1 Subscription Tiers, Billing & Stripe"
        >
          <div className="space-y-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            <p>
              Employer access is offered primarily on a flat monthly subscription model. Current
              published tiers (subject to change on the{" "}
              <Link href="/pricing" className="font-semibold text-[#006e2f] hover:underline">
                Pricing
              </Link>{" "}
              page) include:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="font-semibold text-slate-800">Discovery</strong> — Free ($0):
                limited job posting and anonymous candidate previews;
              </li>
              <li>
                <strong className="font-semibold text-slate-800">Starter</strong> — approximately
                USD&nbsp;19 / month: unlocks full profiles, messaging, and core hiring tools;
              </li>
              <li>
                <strong className="font-semibold text-slate-800">Growth</strong> — approximately
                USD&nbsp;39 / month: expanded capacity and features; and
              </li>
              <li>
                <strong className="font-semibold text-slate-800">Scale</strong> — approximately
                USD&nbsp;79 / month: highest-capacity hiring tools for growing teams.
              </li>
            </ul>
            <p>
              Payments (domestic and international) are processed by{" "}
              <strong className="font-semibold text-slate-800">Stripe</strong>. By
              subscribing, you authorize recurring charges to your selected payment method until you
              cancel through the Stripe Customer Portal or in-product billing settings. Feature
              entitlements (including full profile unlocks and resume downloads) are gated by tier
              as described in-product. Workers join and maintain profiles free of charge; Replaceme
              does not charge placement fees or salary commissions on Worker engagements arranged
              through the Platform. Full billing, proration, refund, chargeback, and dispute rules
              appear in{" "}
              <a href="#6-payments" className="font-semibold text-[#006e2f] hover:underline">
                Section 6
              </a>
              .
            </p>
          </div>
        </RoleCard>

        <RoleCard id="52-extraterritoriality" icon={Scale} title="5.2 Extraterritoriality & Minimum Contacts">
          <div className="space-y-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            <p>
              Under RA 11967, the Act applies to internet transactions where a party is situated in
              the Philippines or where a digital platform, e-retailer, or online merchant{" "}
              <strong className="font-semibold text-slate-800">avails of the Philippine market</strong> and has{" "}
              <strong className="font-semibold text-slate-800">minimum contacts</strong> therein. By using Replaceme to
              recruit, screen, message, unlock, or hire Filipino Workers, international Employers
              establish such minimum contacts with respect to those transactions and agree that
              applicable Philippine laws—including consumer/e-commerce, privacy, and tax rules
              governing the Platform relationship—may apply to those dealings, in addition to laws of
              the Employer&apos;s home jurisdiction.
            </p>
          </div>
        </RoleCard>

        <RoleCard
          id="53-employer-obligations"
          icon={Briefcase}
          title="5.3 Employer Obligations"
        >
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            <li>
              Post accurate, non-discriminatory job opportunities and company information;
            </li>
            <li>
              Comply with applicable labor, immigration, occupational safety, and anti-discrimination
              laws in every jurisdiction where work is performed or Workers are engaged;
            </li>
            <li>
              Maintain a safe, respectful screening and working environment, whether remote or
              on-site;
            </li>
            <li>
              Use Worker contact details, resumes, and profile data solely for legitimate hiring
              purposes related to the role posted or applied for;
            </li>
            <li>
              <strong className="font-semibold text-slate-800">Strictly prohibited:</strong> selling,
              renting, scraping, or using Worker contact information for spam, cold outreach
              unrelated to a genuine opportunity, background checks beyond lawful need without
              disclosure, or any purpose inconsistent with our Privacy Policy; and
            </li>
            <li>
              When you unlock a Worker&apos;s full profile, you become a separate controller /
              processor of that Worker data as described in our Privacy Policy and must protect it
              under RA 10173, GDPR, CCPA, and other applicable laws.
            </li>
          </ul>
        </RoleCard>

        <RoleCard id="54-non-circumvention" icon={User} title="5.4 Non-Circumvention & Fair Use">
          <div className="space-y-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            <p>
              During an active paid subscription term, and for twelve (12) months after you first
              obtain a Worker&apos;s contact details through Replaceme (whichever is longer, unless
              prohibited by law), you agree not to bypass the Platform&apos;s paid features in a
              manner that is intended solely to avoid subscription fees after using Replaceme to
              identify that Worker—for example, systematically unlocking profiles then immediately
              canceling to continue the hiring relationship offline without paying for access you
              already consumed.
            </p>
            <p>
              This clause does not restrict you from hiring Workers, negotiating directly after a
              lawful introduction, or ending a subscription when you no longer need Platform tools.
              It exists to prevent abuse of free/anonymous previews and paid unlocks. We may
              suspend accounts that engage in scraping, mass unlock abuse, or fee-avoidance
              patterns.
            </p>
          </div>
        </RoleCard>
      </div>

      <LegalSectionHeading
        id="6-payments"
        number={6}
        title="Billing, Subscriptions, and Payments"
      />
      <p className="mb-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        This Section applies to all paid Employer subscriptions on Replaceme—whether the Employer is
        located in the Philippines or anywhere else in the world. By purchasing or renewing a paid
        plan, you acknowledge that you have read and agree to the payment and dispute rules below.
      </p>

      <h3
        id="61-stripe-processor"
        className="mb-3 mt-6 scroll-mt-28 text-base font-bold text-slate-900 sm:text-lg"
      >
        6.1 Global Third-Party Payment Processor (Stripe)
      </h3>
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>
          All payments—domestic and international—are processed securely through our third-party
          payment provider,{" "}
          <strong className="font-semibold text-slate-800">Stripe, Inc. and its affiliates</strong>{" "}
          (&quot;Stripe&quot;). Replaceme does not act as a bank, remittance operator, or money
          transmitter. Stripe Checkout and the Stripe Customer Portal are the authorized channels for
          collecting payment methods, charging subscriptions, and managing plan changes.
        </p>
        <p>
          By making a purchase or subscribing, global Employers agree to be bound by Stripe&apos;s
          applicable terms in their respective jurisdictions, including the{" "}
          <a
            href="https://stripe.com/legal/ssa"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#006e2f] hover:underline"
          >
            Stripe Services Agreement
          </a>{" "}
          and, where Stripe Connect or connected-account features apply to your workflow, the{" "}
          <a
            href="https://stripe.com/legal/connect-account"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#006e2f] hover:underline"
          >
            Stripe Connected Account Agreement
          </a>
          . Stripe&apos;s privacy practices are described in the{" "}
          <a
            href="https://stripe.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#006e2f] hover:underline"
          >
            Stripe Privacy Policy
          </a>
          . Consistent with Stripe&apos;s Services Terms on subscriptions and invoicing, before the
          first recurring charge we inform you that transactions occur on an ongoing basis and
          explain how to cancel (in-product billing settings or the Stripe Customer Portal).
        </p>
      </div>

      <h3
        id="62-currency-taxes"
        className="mb-3 mt-6 scroll-mt-28 text-base font-bold text-slate-900 sm:text-lg"
      >
        6.2 International Billing, Currency &amp; Taxes
      </h3>
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>
          The primary currency of billing for Employer subscriptions is{" "}
          <strong className="font-semibold text-slate-800">United States Dollars (USD)</strong>.
          Published list prices (for example, Starter USD&nbsp;19 / month, Growth USD&nbsp;39 /
          month, and Scale USD&nbsp;79 / month) are denominated in USD unless a written enterprise
          agreement or the Pricing page expressly states otherwise.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-semibold text-slate-800">Foreign transaction &amp; FX fees:</strong>{" "}
            If your card or bank is denominated in a currency other than USD, your issuing bank,
            card network, or local payment institution may apply foreign-transaction fees, currency
            conversion rates, and/or cross-border markup. Those fees are charged by your financial
            institution—not by Replaceme—and are your sole responsibility.
          </li>
          <li>
            <strong className="font-semibold text-slate-800">Local taxes, VAT, GST &amp; withholding:</strong>{" "}
            Unless Replaceme expressly collects and remits a tax on an invoice (for example, where
            Stripe Tax or similar tooling is enabled for a jurisdiction), international Employers
            remain responsible for any sales tax, value-added tax (VAT), goods and services tax
            (GST), digital-services tax, withholding tax, or similar levy imposed by their home
            country or by the place where they consume the Services. Replaceme remains the merchant
            of record for standard Stripe Billing subscriptions unless a separate merchant-of-record
            arrangement applies.
          </li>
          <li>
            <strong className="font-semibold text-slate-800">Invoices &amp; tax IDs:</strong> You
            agree to provide accurate billing contact, company, and tax-identification details when
            requested so that invoices and tax documentation can be issued correctly.
          </li>
        </ul>
      </div>

      <h3
        id="63-auto-renewal"
        className="mb-3 mt-6 scroll-mt-28 text-base font-bold text-slate-900 sm:text-lg"
      >
        6.3 Subscription Lifecycle &amp; Recurring Billing
      </h3>
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>
          Paid subscriptions are billed{" "}
          <strong className="font-semibold text-slate-800">in advance</strong> for each billing
          cycle (typically monthly) and{" "}
          <strong className="font-semibold text-slate-800">
            auto-renew automatically at the end of each billing cycle
          </strong>{" "}
          unless you cancel before renewal. By subscribing, you authorize Replaceme (through Stripe)
          to charge your saved payment method on each renewal date for the then-current plan fees
          and any applicable taxes displayed at checkout or on your invoice.
        </p>
        <p>
          You may cancel auto-renewal at any time via the Stripe Customer Portal or in-product
          billing settings. Cancellation stops future renewals; your paid access continues through
          the end of the current paid period. Failed renewals may result in dunning attempts, a
          limited{" "}
          <strong className="font-semibold text-slate-800">past-due grace period</strong>, and
          eventual suspension of paid entitlements if payment is not restored.
        </p>
      </div>

      <h3
        id="64-plan-changes"
        className="mb-3 mt-6 scroll-mt-28 text-base font-bold text-slate-900 sm:text-lg"
      >
        6.4 Upgrades, Downgrades &amp; Proration
      </h3>
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>
          Plan changes are confirmed exclusively through Stripe Checkout or the Stripe Customer
          Portal. Our scheduling logic is:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-semibold text-slate-800">Upgrades</strong> take effect{" "}
            <strong className="font-semibold text-slate-800">immediately</strong>, with applicable
            prorated charges for the unused portion of the higher-tier period invoiced at the time of
            the upgrade (or as otherwise configured in Stripe for immediate proration);
          </li>
          <li>
            <strong className="font-semibold text-slate-800">Downgrades</strong> are scheduled to take
            effect at the <strong className="font-semibold text-slate-800">end of the current billing cycle</strong>. You
            retain your current tier&apos;s entitlements until that date;
          </li>
          <li>
            <strong className="font-semibold text-slate-800">Cancellations</strong> take effect at the
            end of the current billing cycle (cancel-at-period-end). You will not be charged for the
            next cycle after a timely cancellation; and
          </li>
          <li>
            <strong className="font-semibold text-slate-800">No partial refunds</strong> are provided
            for mid-cycle downgrades or for unused time after voluntary cancellation, except where
            required by mandatory consumer law or where Replaceme terminates your account without
            cause before a paid period ends (in which case we may issue a pro-rata credit or refund
            at our discretion or as required by law).
          </li>
        </ul>
      </div>

      <h3
        id="65-refunds-chargebacks"
        className="mb-3 mt-6 scroll-mt-28 text-base font-bold text-slate-900 sm:text-lg"
      >
        6.5 Refunds &amp; Chargebacks
      </h3>
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>
          Unless required by applicable law or expressly agreed in writing by Replaceme:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Fees for commenced subscription periods are generally{" "}
            <strong className="font-semibold text-slate-800">non-refundable</strong>;
          </li>
          <li>
            Billing errors (duplicate charges, incorrect plan billed) should be reported promptly to{" "}
            <a
              href="mailto:support@replaceme.ph"
              className="font-semibold text-[#006e2f] hover:underline"
            >
              support@replaceme.ph
            </a>{" "}
            so we can investigate and, where appropriate, issue a refund or credit through Stripe;
            and
          </li>
          <li>
            Initiating a{" "}
            <strong className="font-semibold text-slate-800">
              fraudulent, abusive, or bad-faith chargeback or dispute
            </strong>{" "}
            with your card issuer, bank, or payment provider after you have received paid Platform
            access—especially without first exhausting our internal billing redress process—will
            result in{" "}
            <strong className="font-semibold text-slate-800">
              immediate account suspension
            </strong>{" "}
            and may result in permanent termination, recovery of unpaid amounts, and reporting of the
            dispute outcome as permitted by card-network and Stripe rules.
          </li>
        </ul>
        <p>
          Legitimate disputes (unauthorized card use, verified billing errors) should still be
          raised first with Replaceme support so we can resolve them quickly without interrupting
          your hiring workflow. Card-network chargebacks remain available where law or network rules
          require, subject to Section 6.6.
        </p>
      </div>

      <h3
        id="66-billing-redress"
        className="mb-3 mt-6 scroll-mt-28 text-base font-bold text-slate-900 sm:text-lg"
      >
        6.6 Internal Redress for Billing Disputes (RA 11967)
      </h3>
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>
          In accordance with{" "}
          <strong className="font-semibold text-slate-800">
            Section 24 of the Internet Transactions Act of 2023 (Republic Act No. 11967)
          </strong>
          , and as a condition of using paid Services,{" "}
          <strong className="font-semibold text-slate-800">
            all users—both Philippine and international Employers and Workers—
          </strong>{" "}
          must first exhaust Replaceme&apos;s internal support and dispute-resolution process for
          billing, subscription, refund, proration, and charge issues{" "}
          <strong className="font-semibold text-slate-800">
            before initiating an external chargeback
          </strong>{" "}
          with a card issuer or payment provider, and before filing a complaint with a regulatory
          body such as the Philippine Department of Trade and Industry (DTI), a foreign consumer
          protection authority, a court, or an alternative dispute-resolution body.
        </p>
        <p>
          File a billing redress request by emailing{" "}
          <a
            href="mailto:support@replaceme.ph"
            className="font-semibold text-[#006e2f] hover:underline"
          >
            support@replaceme.ph
          </a>{" "}
          with the subject &quot;Billing Dispute / Redress Request,&quot; including your account
          email, invoice or Stripe receipt ID, amount disputed, and supporting documents. Under RA
          11967, the internal mechanism is deemed exhausted if the matter remains unresolved after{" "}
          <strong className="font-semibold text-slate-800">seven (7) calendar days</strong> from
          filing. See also{" "}
          <a href="#12-dispute-resolution" className="font-semibold text-[#006e2f] hover:underline">
            Section 12
          </a>{" "}
          for the general Platform redress procedure.
        </p>
      </div>

      <LegalSectionHeading id="7-acceptable-use" number={7} title="Acceptable Use" />
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>You must not:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Violate any law, including labor, privacy, IP, export, or anti-corruption rules;</li>
          <li>Post fraudulent jobs, fake credentials, or malware;</li>
          <li>Harass, discriminate against, or exploit other users;</li>
          <li>Reverse engineer, scrape at scale, or overload Platform infrastructure;</li>
          <li>Impersonate another person or misrepresent your affiliation; or</li>
          <li>Interfere with verification, tax, or redress processes required by law.</li>
        </ul>
      </div>

      <LegalSectionHeading
        id="8-intellectual-property"
        number={8}
        title="Intellectual Property"
      />
      <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
        The Platform, branding, software, and content we provide are owned by Replaceme or its
        licensors. You retain ownership of content you upload (profiles, job posts, messages) and
        grant Replaceme a worldwide, non-exclusive license to host, display, and process that
        content solely to operate and improve the Services. You must not use our marks without prior
        written permission.
      </p>

      <LegalSectionHeading id="9-disclaimers" number={9} title="Disclaimers" />
      <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
        THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot; TO THE MAXIMUM
        EXTENT PERMITTED BY LAW, WE DISCLAIM WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
        PURPOSE, AND NON-INFRINGEMENT. WE DO NOT GUARANTEE that any Worker will be hired, that any
        Employer will fill a role, or that user-submitted information is accurate. You are solely
        responsible for vetting counterparties and for the contracts you form with them.
      </p>

      <LegalSectionHeading
        id="10-limitation-of-liability"
        number={10}
        title="Limitation of Liability"
      />
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, REPLACEME AND ITS OFFICERS, DIRECTORS,
          EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, REVENUE, DATA, OR
          GOODWILL, ARISING FROM YOUR USE OF THE PLATFORM OR FROM ANY ENGAGEMENT BETWEEN USERS.
        </p>
        <p>
          OUR TOTAL AGGREGATE LIABILITY FOR CLAIMS RELATING TO THE SERVICES SHALL NOT EXCEED THE
          GREATER OF (A) THE AMOUNTS YOU PAID TO REPLACEME IN THE TWELVE (12) MONTHS PRECEDING THE
          CLAIM, OR (B) ONE HUNDRED US DOLLARS (USD&nbsp;100). Some jurisdictions do not allow
          certain limitations; in those cases, our liability is limited to the fullest extent
          permitted.
        </p>
      </div>

      <LegalSectionHeading id="11-indemnification" number={11} title="Indemnification" />
      <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
        You agree to indemnify and hold harmless Replaceme from claims, damages, losses, and
        expenses (including reasonable attorneys&apos; fees) arising from your misuse of the
        Platform, your violation of these Terms or applicable law, your job posts or profile
        content, or disputes between you and another user (including labor, tax, or privacy claims
        arising from an engagement you formed).
      </p>

      <LegalSectionHeading
        id="12-dispute-resolution"
        number={12}
        title="Internal Redress Mechanism (RA 11967)"
      />
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>
          In compliance with <strong className="font-semibold text-slate-800">Section 24 of Republic Act No. 11967</strong>, Workers and
          Employers—including international Employers who avail of the Philippine market—who have a
          dispute arising from internet transactions on the Platform (including billing,
          subscriptions, refunds, and charge disputes described in Section 6){" "}
          <strong className="font-semibold text-slate-800">must first avail of Replaceme&apos;s internal redress mechanism</strong> before
          filing a complaint with any court, the Department of Trade and Industry (DTI), other
          government agencies, or alternative dispute resolution bodies, and before escalating to an
          external payment chargeback except where network rules or law require otherwise for
          confirmed unauthorized transactions.
        </p>
        <p>How to file an internal complaint:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Email{" "}
            <a
              href="mailto:support@replaceme.ph"
              className="font-semibold text-[#006e2f] hover:underline"
            >
              support@replaceme.ph
            </a>{" "}
            with the subject line &quot;Dispute / Redress Request,&quot; or submit a request via our{" "}
            <Link href="/contact" className="font-semibold text-[#006e2f] hover:underline">
              Contact
            </Link>{" "}
            page;
          </li>
          <li>
            Include your account email, role (Worker or Employer), a factual summary, supporting
            documents, and the relief sought; and
          </li>
          <li>
            Cooperate reasonably with our review, including providing additional information when
            requested.
          </li>
        </ol>
        <p>
          Under RA 11967, the internal redress mechanism is{" "}
          <strong className="font-semibold text-slate-800">
            deemed exhausted if the complaint remains unresolved after seven (7) calendar days
          </strong>{" "}
          from filing. Nothing in this Section waives rights that cannot be waived under mandatory
          consumer, labor, or privacy law. After exhaustion (or earlier if we confirm in writing that
          we cannot resolve the matter), you may pursue available external remedies.
        </p>
      </div>

      <LegalSectionHeading
        id="13-termination"
        number={13}
        title="Suspension & Termination"
      />
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>
          We may suspend or terminate access immediately if you violate these Terms, fail ID or BIR
          verification requirements, receive a lawful takedown order, pose a security risk, or engage
          in abuse. You may close your account through in-product settings or by contacting support.
          Provisions that by their nature should survive (including IP, liability limits,
          indemnity, and dispute clauses) survive termination.
        </p>
      </div>

      <LegalSectionHeading id="14-governing-law" number={14} title="Governing Law" />
      <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
        These Terms are governed by the laws of the Republic of the Philippines, without regard to
        conflict-of-law principles, except that mandatory consumer or privacy protections of your
        place of residence may also apply. Subject to the internal redress requirement above,
        exclusive venue for disputes that may be brought in court shall be the competent courts of
        Metro Manila, Philippines, unless applicable law requires otherwise.
      </p>

      <LegalSectionHeading id="15-changes" number={15} title="Changes to These Terms" />
      <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
        We may update these Terms to reflect product, legal, or regulatory changes (including RA
        11967, BIR regulations, and NPC guidance). Material changes will be signaled by updating the
        &quot;Last Updated&quot; date and, where appropriate, by in-product or email notice. Your
        continued use after the effective date constitutes acceptance.
      </p>

      <LegalSectionHeading id="16-contact" number={16} title="Contact & Support" />
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 text-base leading-relaxed text-slate-700 sm:px-6 sm:py-5 sm:text-[17px]">
        <p>
          Platform, disputes, and privacy:{" "}
          <a
            href="mailto:support@replaceme.ph"
            className="font-semibold text-[#22c55e] underline underline-offset-2 hover:text-[#16a34a]"
          >
            support@replaceme.ph
          </a>
        </p>
        <p className="mt-2">
          Website:{" "}
          <Link href="https://replaceme.ph" className="font-semibold text-[#006e2f] hover:underline">
            https://replaceme.ph
          </Link>
        </p>
      </div>
    </article>
  );

  if (hideSidebar) {
    return articleContent;
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
      <aside className="order-2 self-start lg:sticky lg:top-28 lg:order-1">
        <nav
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
          aria-label="Table of contents"
        >
          <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Contents
          </p>
          <ol className="max-h-[70vh] space-y-2.5 overflow-y-auto text-sm">
            {tocItems.map((item) => (
              <li key={item.href} className={item.indent ? "pl-4" : undefined}>
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
