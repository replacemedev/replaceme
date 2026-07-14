import Link from "next/link";
import { Cookie, Shield } from "lucide-react";
import { LegalSectionHeading } from "./LegalSectionHeading";

const tocItems = [
  { href: "#1-what-are-cookies", label: "1. What Are Cookies?" },
  { href: "#2-who-this-covers", label: "2. Who This Covers" },
  { href: "#3-categories", label: "3. Cookie Categories" },
  { href: "#4-consent", label: "4. Consent Standards" },
  { href: "#5-manage", label: "5. Managing Preferences" },
  { href: "#6-duration", label: "6. Duration & Third Parties" },
  { href: "#7-updates", label: "7. Updates" },
  { href: "#8-contact", label: "8. Contact" },
];

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-base leading-relaxed text-slate-600 sm:text-[17px]">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <Cookie className="h-3 w-3" aria-hidden />
      </span>
      <span>{children}</span>
    </li>
  );
}

export function CookiePolicyContent({ hideSidebar = false }: { hideSidebar?: boolean }) {
  const articleContent = (
    <article
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 lg:p-10 ${hideSidebar ? "" : "order-1 lg:order-2"}`}
    >
      <div className="mb-10 rounded-xl border border-slate-100 bg-slate-50 p-5 sm:p-6">
        <h2 className="mb-3 flex items-center gap-2 font-bold text-[#22c55e]">
          <Shield className="h-4 w-4 shrink-0" aria-hidden />
          Summary
        </h2>
        <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
          Replaceme uses cookies and similar technologies for users in the Philippines and
          worldwide. Strictly necessary cookies keep the marketplace secure and functional.
          Analytics and marketing cookies are off by default and load only after you give freely
          given, specific, and informed consent—consistent with NPC Circular No. 2023-04, RA 10173,
          GDPR, and CCPA/CPRA disclosure expectations. Pre-checked boxes for optional cookies are
          never used.
        </p>
      </div>

      <LegalSectionHeading id="1-what-are-cookies" number={1} title="What Are Cookies?" />
      <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
        Cookies are small text files placed on your device when you visit a website. Similar
        technologies include local storage, pixels, and SDKs. They help sites remember sign-in
        state, prevent fraud, measure performance, and—only with consent—support analytics or
        advertising.
      </p>

      <LegalSectionHeading id="2-who-this-covers" number={2} title="Who This Policy Covers" />
      <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
        This Cookie Policy applies globally to all visitors and account holders on{" "}
        <Link href="https://replaceme.ph" className="font-semibold text-[#006e2f] hover:underline">
          replaceme.ph
        </Link>
        —including Workers and Employers in the Philippines and international users browsing from
        the EU/EEA, UK, United States, and other jurisdictions. It complements our{" "}
        <Link href="/privacy-policy" className="font-semibold text-[#006e2f] hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      <LegalSectionHeading id="3-categories" number={3} title="Cookie Categories We Use" />
      <ul className="space-y-4">
        <BulletItem>
          <strong className="font-semibold text-slate-800">Strictly necessary (always on).</strong>{" "}
          Required for authentication (Supabase session cookies), security (CSRF / idle-timeout),
          load balancing, fraud prevention, and storing your cookie consent choice itself. These do
          not require optional consent because the Platform cannot function safely without them.
        </BulletItem>
        <BulletItem>
          <strong className="font-semibold text-slate-800">Analytics (opt-in).</strong> Help us
          understand traffic, page performance, and product funnels (for example, which hiring steps
          drop off). We do not enable analytics scripts until you accept analytics or &quot;Accept
          all.&quot;
        </BulletItem>
        <BulletItem>
          <strong className="font-semibold text-slate-800">Marketing (opt-in).</strong> Used for
          advertising measurement, retargeting, or campaign attribution. Disabled until you
          affirmatively opt in. Silence, scrolling, or continued browsing alone never counts as
          consent.
        </BulletItem>
      </ul>

      <LegalSectionHeading
        id="4-consent"
        number={4}
        title="Consent Standards (NPC, GDPR & CCPA)"
      />
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>
          For optional cookies, Replaceme obtains consent that is{" "}
          <strong className="font-semibold text-slate-800">freely given, specific, informed, and
          evidenced</strong> under NPC Circular No. 2023-04 and equivalent GDPR Article 7
          principles:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Clear affirmative action (button click / toggle)—no pre-ticked optional boxes;</li>
          <li>
            Equal prominence for accepting, rejecting non-essential, and managing preferences;
          </li>
          <li>Granular control separately for analytics and marketing;</li>
          <li>
            Layered notice linking to this Policy and the ability to withdraw as easily as consent
            was given via Cookie settings in the footer; and
          </li>
          <li>
            California residents: we disclose cookie/advertising uses in our Privacy Policy; we do
            not sell personal information in the traditional sense, and marketing cookies run only
            after opt-in.
          </li>
        </ul>
      </div>

      <LegalSectionHeading id="5-manage" number={5} title="How to Manage Preferences" />
      <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
        <p>On your first visit (and after material Cookie Policy version updates), a banner offers:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-semibold text-slate-800">Accept all</strong> — enables analytics
            and marketing;
          </li>
          <li>
            <strong className="font-semibold text-slate-800">Reject non-essential</strong> — keeps
            only strictly necessary cookies; and
          </li>
          <li>
            <strong className="font-semibold text-slate-800">Manage preferences</strong> — toggle
            categories individually (analytics and marketing default off).
          </li>
        </ul>
        <p>
          Preferences are stored in your browser&apos;s local storage under a consent record keyed
          to the current Cookie Policy version. If you are signed in, we may also sync preferences
          to your account so they apply across devices. You can reopen settings anytime from the
          site footer (&quot;Cookie settings&quot;).
        </p>
        <p>
          You may also clear or block cookies via your browser; blocking strictly necessary cookies
          may prevent sign-in or core marketplace features from working.
        </p>
      </div>

      <LegalSectionHeading id="6-duration" number={6} title="Duration & Third Parties" />
      <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
        Session cookies expire when you close the browser; persistent cookies remain until they
        expire or you delete them. Consent records are retained long enough to demonstrate
        compliance and until you withdraw or a new policy version requires fresh consent.
        Third-party processors (for example, analytics or ads vendors you enable) set their own
        cookies subject to their policies; we only load those vendors after opt-in.
      </p>

      <LegalSectionHeading id="7-updates" number={7} title="Updates to This Policy" />
      <p className="text-base leading-relaxed text-slate-600 sm:text-[17px]">
        When we change cookie purposes, categories, or vendors in a material way, we update this
        Policy, bump the Cookie Policy version, and request renewed consent where required so prior
        optional consent is not treated as continuing for incompatible uses.
      </p>

      <LegalSectionHeading id="8-contact" number={8} title="Contact" />
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 text-base leading-relaxed text-slate-700 sm:px-6 sm:py-5 sm:text-[17px]">
        <p>
          Cookie or consent questions:{" "}
          <a
            href="mailto:support@replaceme.ph"
            className="font-semibold text-[#22c55e] underline underline-offset-2 hover:text-[#16a34a]"
          >
            support@replaceme.ph
          </a>
        </p>
        <p className="mt-2">
          Or use our{" "}
          <Link href="/contact" className="font-semibold text-[#006e2f] hover:underline">
            Contact page
          </Link>
          .
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
