import Link from "next/link";

const tocItems = [
  { href: "#1-who-we-are", label: "1. Who We Are" },
  { href: "#2-what-we-collect", label: "2. What We Collect" },
  { href: "#3-how-we-use-it", label: "3. How We Use It" },
  { href: "#4-sharing", label: "4. Who We Share It With" },
  { href: "#5-security", label: "5. Data Security" },
  { href: "#6-retention", label: "6. How Long We Keep It" },
  { href: "#7-your-rights", label: "7. Your Rights" },
  { href: "#8-cookies", label: "8. Cookies" },
  { href: "#9-changes", label: "9. Changes to This Policy" },
  { href: "#10-contact", label: "10. Contact Us" },
];

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

export function PrivacyPolicyContent() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-xs sm:px-10 sm:py-12">
      {/* Last updated */}
      <p className="inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
        Last updated: July 2026
      </p>

      {/* Intro */}
      <p className="text-[15px] leading-relaxed text-slate-600 sm:text-base">
        At Replace Me (<strong>replaceme.app</strong>), we take your privacy seriously. This policy explains what personal
        information we collect, why we collect it, and how we protect it. We follow the{" "}
        <strong>Philippines Data Privacy Act of 2012 (RA 10173)</strong> and aim to be as transparent as possible.
      </p>

      {/* TOC */}
      <nav aria-label="Table of contents" className="rounded-xl border border-slate-100 bg-slate-50 p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">On this page</p>
        <ol className="space-y-1.5">
          {tocItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-sm font-medium text-emerald-700 hover:underline"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Sections */}
      <Section id="1-who-we-are" title="1. Who We Are">
        <p>
          Replace Me is an online hiring platform that connects employers with remote workers,
          primarily in the Philippines. We are the data controller for all personal information
          collected through this website.
        </p>
        <p>
          Our registered contact for privacy matters is:{" "}
          <a href="mailto:support@replaceme.ph" className="font-semibold text-emerald-700 hover:underline">
          support@replaceme.ph
          </a>
        </p>
      </Section>

      <Section id="2-what-we-collect" title="2. What We Collect">
        <p>We collect information you provide directly and information generated as you use the platform.</p>

        <p className="font-semibold text-slate-800">Information you give us:</p>
        <ul className="space-y-2 pl-1">
          <Bullet>Name, email address, and password when you create an account</Bullet>
          <Bullet>Professional details: job title, skills, work experience, and bio (workers)</Bullet>
          <Bullet>Company name, industry, size, and website (employers)</Bullet>
          <Bullet>Profile photos or company logos you upload</Bullet>
          <Bullet>Messages and communications sent through the platform</Bullet>
          <Bullet>Payment billing details (processed securely by Stripe — we do not store card numbers)</Bullet>
        </ul>

        <p className="font-semibold text-slate-800">Information collected automatically:</p>
        <ul className="space-y-2 pl-1">
          <Bullet>Device type, browser, and operating system</Bullet>
          <Bullet>Pages visited and features used</Bullet>
          <Bullet>IP address and general location (country/city level)</Bullet>
          <Bullet>Cookies and similar tracking technologies (see Section 8)</Bullet>
        </ul>
      </Section>

      <Section id="3-how-we-use-it" title="3. How We Use It">
        <p>We use your information to:</p>
        <ul className="space-y-2 pl-1">
          <Bullet>Create and manage your account</Bullet>
          <Bullet>Match workers with relevant job postings</Bullet>
          <Bullet>Enable employers and workers to communicate</Bullet>
          <Bullet>Process subscription payments and credits</Bullet>
          <Bullet>Send you important notifications about your account or applications</Bullet>
          <Bullet>Improve the platform, fix bugs, and develop new features</Bullet>
          <Bullet>Comply with legal obligations under Philippine law</Bullet>
        </ul>
        <p>
          We will not use your information for purposes incompatible with what is described here without
          obtaining your explicit consent first.
        </p>
      </Section>

      <Section id="4-sharing" title="4. Who We Share It With">
        <p>We do not sell your personal data. We share information only in these circumstances:</p>
        <ul className="space-y-2 pl-1">
          <Bullet>
            <strong>Between users:</strong> Employers see worker profiles when you apply or your profile matches their search.
            Workers see employer company profiles and job details.
          </Bullet>
          <Bullet>
            <strong>Service providers:</strong> We use trusted third-party services to operate the platform,
            including Supabase (database), Stripe (payments), Resend (email), and Vercel (hosting).
            These providers only process data as needed to provide their services.
          </Bullet>
          <Bullet>
            <strong>Legal requirements:</strong> We may disclose information when required by law,
            court order, or to protect the rights and safety of our users.
          </Bullet>
          <Bullet>
            <strong>Safety reports:</strong> Workers may confidentially report employers or jobs.
            Employers use platform issue reporting or support email for product problems — not
            worker-report tools.
          </Bullet>
          <Bullet>
            <strong>Business transfers:</strong> If Replace Me is acquired or merges with another company,
            your information may be transferred as part of that transaction. You will be notified in advance.
          </Bullet>
        </ul>
      </Section>

      <Section id="5-security" title="5. Data Security">
        <p>
          We protect your data using industry-standard security measures, including encryption in transit
          (TLS/HTTPS), encrypted storage, strict access controls, and regular security audits.
        </p>
        <p>
          While we take every reasonable precaution, no system is 100% secure. If a security breach
          affects your data, we will notify you in accordance with our obligations under RA 10173 and
          the NPC Circular 2022-01.
        </p>
      </Section>

      <Section id="6-retention" title="6. How Long We Keep It">
        <p>We keep your personal data for as long as your account is active or as needed to provide our services.</p>
        <ul className="space-y-2 pl-1">
          <Bullet>Active account data is retained for the duration of your account</Bullet>
          <Bullet>If you delete your account, we remove your personal data within 30 days</Bullet>
          <Bullet>Certain records may be retained longer for legal, tax, or compliance purposes</Bullet>
          <Bullet>Anonymised or aggregated data may be kept indefinitely for platform analytics</Bullet>
        </ul>
      </Section>

      <Section id="7-your-rights" title="7. Your Rights">
        <p>Under the Philippine Data Privacy Act, you have the right to:</p>
        <ul className="space-y-2 pl-1">
          <Bullet><strong>Access</strong> the personal data we hold about you</Bullet>
          <Bullet><strong>Correct</strong> inaccurate or incomplete data</Bullet>
          <Bullet><strong>Delete</strong> your account and personal data</Bullet>
          <Bullet><strong>Object</strong> to how we process your data in certain circumstances</Bullet>
          <Bullet><strong>Data portability</strong> — receive a copy of your data in a readable format</Bullet>
          <Bullet><strong>Withdraw consent</strong> at any time where we rely on consent to process your data</Bullet>
        </ul>
        <p>
          To exercise any of these rights, email us at{" "}
          <a href="mailto:support@replaceme.ph" className="font-semibold text-emerald-700 hover:underline">
          support@replaceme.ph
          </a>
          . We will respond within 30 days.
        </p>
        <p>
          If you want to delete your account, you can also contact our support team at{" "}
          <a href="mailto:support@replaceme.ph" className="font-semibold text-emerald-700 hover:underline">
            support@replaceme.ph
          </a>
          .
        </p>
      </Section>

      <Section id="8-cookies" title="8. Cookies">
        <p>
          We use cookies to keep you logged in, remember your preferences, and understand how people use
          the platform. See our{" "}
          <Link href="/cookie-policy" className="font-semibold text-emerald-700 hover:underline">
            Cookie Policy
          </Link>{" "}
          for full details and how to manage your preferences.
        </p>
      </Section>

      <Section id="9-changes" title="9. Changes to This Policy">
        <p>
          We may update this policy from time to time. When we do, we will update the date at the top
          of this page and, for significant changes, notify you via email or an in-app notice.
        </p>
        <p>
          Your continued use of Replace Me after changes are posted means you accept the updated policy.
        </p>
      </Section>

      <Section id="10-contact" title="10. Contact Us">
        <p>Have a question about this policy or your data? Reach out:</p>
        <ul className="space-y-2 pl-1">
          <Bullet>
            <strong>Privacy matters:</strong>{" "}
            <a href="mailto:support@replaceme.ph" className="font-semibold text-emerald-700 hover:underline">
            support@replaceme.ph
            </a>
          </Bullet>
          <Bullet>
            <strong>General support:</strong>{" "}
            <a href="mailto:support@replaceme.ph" className="font-semibold text-emerald-700 hover:underline">
              support@replaceme.ph
            </a>
          </Bullet>
        </ul>
        <p>
          You also have the right to lodge a complaint with the Philippine{" "}
          <strong>National Privacy Commission (NPC)</strong> if you believe your rights have been violated.
        </p>
      </Section>
    </div>
  );
}
