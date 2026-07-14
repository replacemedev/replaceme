import Link from "next/link";
import { Check, Shield } from "lucide-react";

function CheckItem({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm sm:text-[15px] text-slate-600 leading-relaxed">
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
        <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
      </span>
      <span>
        {label ? (
          <>
            <strong className="font-semibold text-slate-800">{label}</strong>{" "}
          </>
        ) : null}
        {children}
      </span>
    </li>
  );
}

export function PrivacyPolicyContent() {
  return (
    <article className="max-w-3xl mx-auto">
      <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 sm:p-6 mb-10">
        <h2 className="flex items-center gap-2 font-bold text-[#22c55e] mb-3">
          <Shield className="h-4 w-4 shrink-0" aria-hidden />
          Summary
        </h2>
        <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
          At Replaceme, we believe in transparency and the protection of your personal
          information. This Privacy Policy outlines how we collect, use, and safeguard your data
          when you use our platform to find work, hire talent, or communicate within our network. Our
          commitment to your privacy is rooted in maintaining a secure, professional environment for
          all users.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
          1. Information Collection
        </h2>
        <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed mb-5">
          We collect information necessary to provide and improve our services. This includes data
          you provide directly, as well as information collected automatically during your
          interaction with Replaceme.
        </p>
        <ul className="space-y-4">
          <CheckItem label="Account Data:">
            Name, email address, password, and professional profile details.
          </CheckItem>
          <CheckItem label="Transaction Data:">
            Billing information, payout details, and transaction history related to jobs.
          </CheckItem>
          <CheckItem label="Usage Data:">
            Device information, IP addresses, log data, and interaction metrics.
          </CheckItem>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">2. Use of Data</h2>
        <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed mb-5">
          The information we collect is utilized to ensure a seamless, secure, and personalized
          experience on the Replaceme platform.
        </p>
        <ul className="space-y-4">
          <CheckItem>Facilitating connections between freelancers and clients.</CheckItem>
          <CheckItem>Processing payments and maintaining secure transaction records.</CheckItem>
          <CheckItem>Improving platform performance, security, and user interface.</CheckItem>
          <CheckItem>
            Communicating updates, security alerts, and promotional offers (opt-out available).
          </CheckItem>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
          3. Cookies & Tracking
        </h2>
        <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
          Replaceme uses cookies and similar tracking technologies to track activity on our
          service and hold certain information. Cookies are files with a small amount of data which
          may include an anonymous unique identifier. You can instruct your browser to refuse all
          cookies or to indicate when a cookie is being sent. However, if you do not accept cookies,
          you may not be able to use some portions of our service.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
          4. Third-Party Sharing
        </h2>
        <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed mb-5">
          We do not sell your personal data. We may share information with trusted third parties
          exclusively for operational purposes under strict confidentiality agreements.
        </p>
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 sm:p-6">
          <ul className="space-y-3 text-sm sm:text-[15px] text-slate-600 leading-relaxed list-none">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-slate-400 shrink-0 mt-2" aria-hidden />
              <span>
                <strong className="font-semibold text-slate-800">Payment Processors:</strong> To
                facilitate secure financial transactions.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-slate-400 shrink-0 mt-2" aria-hidden />
              <span>
                <strong className="font-semibold text-slate-800">Cloud Providers:</strong> For
                secure data hosting and infrastructure management.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-slate-400 shrink-0 mt-2" aria-hidden />
              <span>
                <strong className="font-semibold text-slate-800">Legal Compliance:</strong> When
                required by law or to protect our legal rights.
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">5. Your Privacy Rights</h2>
        <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed mb-5">
          You maintain full control over your personal data. Depending on your location, you may have
          the following rights regarding your information:
        </p>
        <ul className="space-y-4 mb-8">
          <CheckItem>The right to access, update, or delete your personal information.</CheckItem>
          <CheckItem>The right to object to or restrict processing of your data.</CheckItem>
          <CheckItem>The right to data portability.</CheckItem>
        </ul>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 sm:px-6 sm:py-5 text-center">
          <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed">
            To exercise these rights, please contact our Data Protection Officer at{" "}
            <Link
              href="mailto:privacy@replaceme.com"
              className="font-semibold text-[#22c55e] underline underline-offset-2 hover:text-[#16a34a]"
            >
              privacy@replaceme.com
            </Link>
            .
          </p>
        </div>
      </section>
    </article>
  );
}
