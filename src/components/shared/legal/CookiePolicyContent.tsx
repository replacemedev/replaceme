import Link from "next/link";
import { Cookie, Shield } from "lucide-react";

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm sm:text-[15px] text-slate-600 leading-relaxed">
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
        <Cookie className="h-3 w-3" aria-hidden />
      </span>
      <span>{children}</span>
    </li>
  );
}

export function CookiePolicyContent() {
  return (
    <article className="max-w-3xl mx-auto">
      <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 sm:p-6 mb-10">
        <h2 className="flex items-center gap-2 font-bold text-[#22c55e] mb-3">
          <Shield className="h-4 w-4 shrink-0" aria-hidden />
          Summary
        </h2>
        <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
          Replaceme uses cookies and similar technologies to keep the platform secure,
          remember your preferences, and—only with your consent—understand how the site is used
          or show relevant marketing. You can accept all cookies, reject non-essential cookies,
          or manage categories at any time via the cookie banner or footer settings link.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
          1. What are cookies?
        </h2>
        <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
          Cookies are small text files stored on your device when you visit a website. They help
          sites function, remember choices, and—where permitted—measure usage or deliver
          marketing.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
          2. Categories we use
        </h2>
        <ul className="space-y-4">
          <BulletItem>
            <strong className="font-semibold text-slate-800">Strictly necessary</strong> —
            Required for authentication, security, and core marketplace features. Always active.
          </BulletItem>
          <BulletItem>
            <strong className="font-semibold text-slate-800">Analytics</strong> — Help us
            understand traffic and product usage (e.g. page views, funnels). Only loaded after
            you opt in.
          </BulletItem>
          <BulletItem>
            <strong className="font-semibold text-slate-800">Marketing</strong> — Used for
            advertising, retargeting, or campaign measurement. Only loaded after you opt in.
          </BulletItem>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
          3. Your choices
        </h2>
        <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed mb-4">
          When you first visit, you may <strong>Accept all</strong>,{" "}
          <strong>Reject non-essential</strong>, or open <strong>Manage preferences</strong> to
          toggle analytics and marketing independently. You can change your mind anytime using
          Cookie settings in the site footer.
        </p>
        <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
          If you are signed in, we store your preferences on your account so they apply across
          devices. Guests&apos; choices are stored locally in the browser.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
          4. Related policies
        </h2>
        <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
          For how we process personal data more broadly, see our{" "}
          <Link href="/privacy-policy" className="text-[#006e2f] font-semibold hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">5. Contact</h2>
        <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
          Questions about cookies or consent? Contact us via the{" "}
          <Link href="/contact" className="text-[#006e2f] font-semibold hover:underline">
            Contact page
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
