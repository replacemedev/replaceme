import Link from "next/link";
import { Briefcase, User } from "lucide-react";
import { LegalSectionHeading } from "./LegalSectionHeading";

const tocItems = [
  { href: "#1-acceptance-of-terms", label: "1. Acceptance of Terms" },
  { href: "#2-user-obligations", label: "2. User Obligations" },
  { href: "#21-for-employers", label: "2.1 For Employers", indent: true },
  { href: "#22-for-workers-talent", label: "2.2 For Workers (Talent)", indent: true },
  { href: "#3-payments-and-fees", label: "3. Payments & Fees" },
  { href: "#4-termination", label: "4. Termination" },
  { href: "#5-limitation-of-liability", label: "5. Limitation of Liability" },
];

export function TermsOfServiceContent({ hideSidebar = false }: { hideSidebar?: boolean }) {
  const articleContent = (
    <article className={`bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-xs ${hideSidebar ? "" : "order-1 lg:order-2"}`}>
      <div className="space-y-4 text-sm sm:text-[15px] text-slate-600 leading-relaxed">
        <p>
          Welcome to Replaceme (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;).
          These Terms of Service (&quot;Terms&quot;) govern your use of our website, platform, and
          related services (collectively, the &quot;Services&quot;). By accessing or using our
          Services, you agree to be bound by these Terms and our Privacy Policy.
        </p>
        <p>
          If you do not agree to these Terms, you may not access or use the Services. These Terms
          constitute a legally binding agreement between you and Replaceme.
        </p>
      </div>

      <LegalSectionHeading
        id="1-acceptance-of-terms"
        number={1}
        title="Acceptance of Terms"
      />
      <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
        By registering for an account, or by using the Platform in any manner, including but not
        limited to visiting or browsing the Platform, you agree to these Terms of Service and all
        other operating rules, policies, and procedures that may be published from time to time on
        the Platform by us, each of which is incorporated by reference and each of which may be
        updated from time to time without notice to you.
      </p>

      <LegalSectionHeading id="2-user-obligations" number={2} title="User Obligations" />
      <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed mb-4">
        As a condition of use, you promise not to use the Services for any purpose that is
        prohibited by these Terms of Service. You are responsible for all of your activity in
        connection with the Services.
      </p>

      <div
        id="21-for-employers"
        className="bg-slate-50 rounded-xl border border-slate-100 p-5 sm:p-6 mb-4 scroll-mt-28"
      >
        <h3 className="flex items-center gap-2.5 font-bold text-slate-900 mb-3">
          <Briefcase className="h-4 w-4 text-[#22c55e] shrink-0" aria-hidden />
          2.1 For Employers
        </h3>
        <ul className="space-y-2.5 text-sm text-slate-600 list-disc pl-5 leading-relaxed">
          <li>You represent that you have the authority to bind the entity on whose behalf you are acting.</li>
          <li>You agree to provide accurate and complete information regarding job postings and company details.</li>
          <li>You will not post deceptive, discriminatory, or illegal job opportunities.</li>
          <li>You are solely responsible for evaluating candidates and ensuring compliance with local employment laws.</li>
        </ul>
      </div>

      <div
        id="22-for-workers-talent"
        className="bg-slate-50 rounded-xl border border-slate-100 p-5 sm:p-6 scroll-mt-28"
      >
        <h3 className="flex items-center gap-2.5 font-bold text-slate-900 mb-3">
          <User className="h-4 w-4 text-[#22c55e] shrink-0" aria-hidden />
          2.2 For Workers (Talent)
        </h3>
        <ul className="space-y-2.5 text-sm text-slate-600 list-disc pl-5 leading-relaxed">
          <li>You agree to provide accurate representation of your skills, experience, and qualifications.</li>
          <li>
            You will maintain the confidentiality of any proprietary information shared by potential
            employers during the interview process.
          </li>
          <li>You agree not to use automated scripts or bots to apply for positions.</li>
          <li>
            You are responsible for determining your own tax obligations resulting from employment
            secured through the platform.
          </li>
        </ul>
      </div>

      <LegalSectionHeading id="3-payments-and-fees" number={3} title="Payments & Fees" />
      <div className="space-y-4 text-sm sm:text-[15px] text-slate-600 leading-relaxed">
        <p>
          Certain aspects of the Services may be provided for a fee or other charge. If you elect
          to use paid aspects of the Services, you agree to our Pricing and Payment Terms, as we
          may update them from time to time.
        </p>
        <p>
          Replaceme reserves the right to change its price list and to institute new charges at
          any time, upon notice to you, which may be sent by email or posted on the Platform. Your
          use of the Services following such notification constitutes your acceptance of any new or
          increased charges.
        </p>
      </div>

      <LegalSectionHeading id="4-termination" number={4} title="Termination" />
      <div className="space-y-4 text-sm sm:text-[15px] text-slate-600 leading-relaxed">
        <p>
          We may terminate your access to all or any part of the Services at any time, with or
          without cause, with or without notice, effective immediately, which may result in the
          forfeiture and destruction of all information associated with your membership.
        </p>
        <p>
          If you wish to terminate your account, you may do so by following the instructions on the
          Platform. All provisions of these Terms of Service which by their nature should survive
          termination shall survive termination, including, without limitation, ownership
          provisions.
        </p>
      </div>

      <LegalSectionHeading
        id="5-limitation-of-liability"
        number={5}
        title="Limitation of Liability"
      />
      <p className="text-sm sm:text-[15px] text-slate-500 italic leading-relaxed">
        Content not provided in source.
      </p>
    </article>
  );

  if (hideSidebar) {
    return articleContent;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-8 lg:gap-10 items-start">
      <aside className="lg:sticky lg:top-28 self-start order-2 lg:order-1">
        <nav
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs"
          aria-label="Table of contents"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
            Contents
          </p>
          <ol className="space-y-2.5 text-sm">
            {tocItems.map((item) => (
              <li key={item.href} className={item.indent ? "pl-4" : undefined}>
                <Link
                  href={item.href}
                  className="text-slate-600 hover:text-[#22c55e] transition-colors leading-snug"
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
