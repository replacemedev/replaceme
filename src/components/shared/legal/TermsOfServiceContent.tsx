function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-slate-600 sm:text-base">
      {children}
    </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
      <span>{children}</span>
          </li>
  );
}

const tocItems = [
  { href: "#1-about", label: "1. About Replace Me" },
  { href: "#2-accounts", label: "2. Your Account" },
  { href: "#3-employers", label: "3. Employer Rules" },
  { href: "#4-workers", label: "4. Worker Rules" },
  { href: "#5-payments", label: "5. Payments & Subscriptions" },
  { href: "#6-prohibited", label: "6. What You Cannot Do" },
  { href: "#7-ip", label: "7. Intellectual Property" },
  { href: "#8-disclaimers", label: "8. Disclaimers & Liability" },
  { href: "#9-termination", label: "9. Termination" },
  { href: "#10-governing-law", label: "10. Governing Law" },
  { href: "#11-contact", label: "11. Contact Us" },
];

export function TermsOfServiceContent() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-xs sm:px-10 sm:py-12">
      <p className="inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
        Last updated: July 2026
      </p>

      <p className="text-[15px] leading-relaxed text-slate-600 sm:text-base">
        Welcome to Replace Me. By creating an account or using our platform, you agree to these Terms
        of Service. Please read them carefully — they form a legally binding agreement between you
        and Replace Me.
      </p>

      {/* TOC */}
      <nav aria-label="Table of contents" className="rounded-xl border border-slate-100 bg-slate-50 p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">On this page</p>
        <ol className="space-y-1.5">
          {tocItems.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="text-sm font-medium text-emerald-700 hover:underline">
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <Section id="1-about" title="1. About Replace Me">
        <p>
          Replace Me (<strong>replaceme.app</strong>) is an online hiring marketplace that connects employers
          with remote workers. We provide the platform and tools — but we are not a party to any
          employment or service agreement between employers and workers. Any work arrangements are
          directly between the two parties.
        </p>
      </Section>

      <Section id="2-accounts" title="2. Your Account">
        <p>To use Replace Me, you must:</p>
        <ul className="space-y-2 pl-1">
          <Bullet>Be at least 18 years old</Bullet>
          <Bullet>Provide accurate and complete information when signing up</Bullet>
          <Bullet>Keep your password secure and not share your account with anyone</Bullet>
          <Bullet>Notify us immediately if you suspect unauthorised access to your account</Bullet>
        </ul>
        <p>
          You are responsible for all activity that occurs under your account. We reserve the right to
          suspend or terminate accounts that violate these terms.
        </p>
      </Section>

      <Section id="3-employers" title="3. Employer Rules">
        <p>As an employer, you agree to:</p>
        <ul className="space-y-2 pl-1">
          <Bullet>Post only genuine, legal job listings</Bullet>
          <Bullet>Not discriminate in hiring based on race, gender, religion, age, or any protected characteristic</Bullet>
          <Bullet>Handle worker personal data responsibly and in line with applicable privacy laws</Bullet>
          <Bullet>Pay agreed rates promptly and honour any work arrangements you make</Bullet>
          <Bullet>Not contact workers for purposes unrelated to the job posted</Bullet>
          <Bullet>
            Use “Report an issue” or email support for platform problems — employers cannot file
            in-app reports against workers
          </Bullet>
        </ul>
      </Section>

      <Section id="4-workers" title="4. Worker Rules">
        <p>As a worker, you agree to:</p>
        <ul className="space-y-2 pl-1">
          <Bullet>Provide accurate information on your profile, including skills and experience</Bullet>
          <Bullet>Only apply for roles you are genuinely qualified for</Bullet>
          <Bullet>Communicate honestly and professionally with employers</Bullet>
          <Bullet>Not create multiple accounts or impersonate others</Bullet>
          <Bullet>Not share confidential employer information with third parties</Bullet>
          <Bullet>
            Report employers or jobs that violate these Terms via the in-app report tools or support
          </Bullet>
        </ul>
      </Section>

      <Section id="5-payments" title="5. Payments & Subscriptions">
        <p>
          Employer subscriptions are billed in advance on a{" "}
          <strong>monthly</strong> or <strong>annual prepaid</strong> basis
          (USD, tax-exclusive list prices). Annual plans are charged once per
          year; the website may show a monthly equivalent for comparison.
          Payments are processed securely by Stripe. By subscribing, you
          authorise us (or Stripe on our behalf) to charge the payment method on
          file and to renew the subscription at the end of each billing period
          until you cancel.
        </p>
        <ul className="space-y-2 pl-1">
          <Bullet>
            <strong>Key terms at checkout:</strong> Before you pay, we disclose
            the plan name, whether billing is monthly or annual, the amount due
            today, that the subscription renews automatically, and that you can
            cancel online from Account Settings (Stripe Customer Portal).
          </Bullet>
          <Bullet>
            <strong>Cancellations:</strong> You may cancel at any time online. Your
            subscription remains active until the end of the current paid billing
            period (end of the month for monthly plans, or end of the prepaid year
            for annual plans). Cancellation does not by itself create a partial
            refund for unused time.
          </Bullet>
          <Bullet>
            <strong>Refunds:</strong> Refunds are handled under our{" "}
            <a href="/refund-policy" className="font-semibold text-emerald-700 hover:underline">
              Refund Policy
            </a>
            . Commenced B2B periods are generally non-refundable except for
            billing errors, mandatory law, or limited goodwill for Platform fault.
          </Bullet>
          <Bullet>
            <strong>Price changes:</strong> We will give you at least 30 days
            notice before changing your subscription price for a renewal period.
          </Bullet>
          <Bullet>
            <strong>Tax:</strong> Applicable GST/VAT or sales tax may be added at
            checkout by Stripe Tax based on your billing location. Tax is remitted
            to the relevant authority when required.
          </Bullet>
        </ul>
      </Section>

      <Section id="6-prohibited" title="6. What You Cannot Do">
        <p>The following are strictly prohibited on Replace Me:</p>
        <ul className="space-y-2 pl-1">
          <Bullet>Posting fake jobs or profiles</Bullet>
          <Bullet>Scamming, defrauding, or misleading other users</Bullet>
          <Bullet>Spam messaging or unsolicited marketing</Bullet>
          <Bullet>Scraping or harvesting data from the platform</Bullet>
          <Bullet>Attempting to hack, overload, or disrupt the platform</Bullet>
          <Bullet>Using the platform to facilitate illegal activity</Bullet>
          <Bullet>Sharing another user&apos;s personal data without consent</Bullet>
        </ul>
        <p>
          Violations may result in immediate account suspension and, where appropriate, legal action.
        </p>
      </Section>

      <Section id="7-ip" title="7. Intellectual Property">
        <p>
          Replace Me and its content (design, code, text, and branding) are owned by us or our
          licensors. You may not copy, modify, or distribute our platform or content without
          written permission.
        </p>
        <p>
          You retain ownership of content you post (your profile, job listings, messages). By posting,
          you grant us a non-exclusive licence to display that content on the platform.
        </p>
      </Section>

      <Section id="8-disclaimers" title="8. Disclaimers & Liability">
        <p>
          Replace Me provides the platform &quot;as is.&quot; We do not guarantee uninterrupted service,
          that job listings are legitimate, or that any particular job match will result in employment.
          We are not responsible for any work arrangements, disputes, or losses that arise between
          employers and workers.
        </p>
        <p>
          To the maximum extent permitted by Philippine law, our total liability to you for any claim
          arising from use of the platform is limited to the amount you paid us in the three months
          before the claim arose.
        </p>
      </Section>

      <Section id="9-termination" title="9. Termination">
        <p>
          You may close your account at any time by contacting{" "}
          <a href="mailto:support@replaceme.ph" className="font-semibold text-emerald-700 hover:underline">
            support@replaceme.ph
          </a>
          .
        </p>
        <p>
          We may suspend or close your account if you violate these terms, engage in fraudulent
          activity, or if required by law. We will give you reasonable notice where possible.
        </p>
      </Section>

      <Section id="10-governing-law" title="10. Governing Law">
        <p>
          These terms are governed by the laws of the Republic of the Philippines. Any disputes
          will be resolved in the courts of the Philippines.
        </p>
      </Section>

      <Section id="11-contact" title="11. Contact Us">
        <p>
          Questions about these terms? Email us at{" "}
          <a href="mailto:support@replaceme.ph" className="font-semibold text-emerald-700 hover:underline">
            support@replaceme.ph
          </a>
          .
        </p>
      </Section>
    </div>
  );
}
