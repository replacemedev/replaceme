import React from "react";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/shared/cookie-consent";
import { NavBrand } from "@/components/shared/nav/NavBrand";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-12 md:py-16 relative overflow-hidden">
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-30 pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-1 xl:col-span-2 max-w-xs mb-6 lg:mb-0">
            <NavBrand homeHref="/" />
            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
              Empowering global teams with elite Filipino remote talent. Building direct connections for long-term success.
            </p>
          </div>

          {/* Employer Links Column */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-950 uppercase tracking-wider mb-4">
              Employers
            </h3>
            <div className="space-y-3">
              <Link className="text-base text-gray-600 hover:text-emerald-600 transition-colors block" href="/signup">
                Post a Job
              </Link>
              <Link className="text-base text-gray-600 hover:text-emerald-600 transition-colors block" href="/help/hiring-guide">
                Hiring Guide
              </Link>
              <Link className="text-base text-gray-600 hover:text-emerald-600 transition-colors block" href="/pricing">
                Pricing
              </Link>
              <Link className="text-base text-gray-600 hover:text-emerald-600 transition-colors block" href="/faq/employer">
                Employer FAQs
              </Link>
            </div>
          </div>

          {/* Jobseeker Links Column */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-950 uppercase tracking-wider mb-4">
              Jobseekers
            </h3>
            <div className="space-y-3">
              <Link className="text-base text-gray-600 hover:text-emerald-600 transition-colors block" href="/jobs">
                Browse Jobs
              </Link>
              <Link className="text-base text-gray-600 hover:text-emerald-600 transition-colors block" href="/signup">
                Create Profile
              </Link>
              <Link className="text-base text-gray-600 hover:text-emerald-600 transition-colors block" href="/faq/worker">
                Worker FAQs
              </Link>
            </div>
          </div>

          {/* Legal & Support Column */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-950 uppercase tracking-wider mb-4">
              Company &amp; Legal
            </h3>
            <div className="space-y-3">
              <Link className="text-base text-gray-600 hover:text-emerald-600 transition-colors block" href="/help">
                Help Center
              </Link>
              <Link className="text-base text-gray-600 hover:text-emerald-600 transition-colors block" href="/contact">
                Contact Us
              </Link>
              <Link className="text-base text-gray-600 hover:text-emerald-600 transition-colors block" href="/privacy-policy">
                Privacy Policy
              </Link>
              <Link className="text-base text-gray-600 hover:text-emerald-600 transition-colors block" href="/terms-of-service">
                Terms of Service
              </Link>
              <Link
                className="text-base text-gray-600 hover:text-emerald-600 transition-colors block"
                href="/terms-of-service#51-subscriptions"
              >
                Subscription Terms
              </Link>
              <Link
                className="text-base text-gray-600 hover:text-emerald-600 transition-colors block"
                href="/terms-of-service#6-payments"
              >
                Billing &amp; Payment Policy
              </Link>
              <Link
                className="text-base text-gray-600 hover:text-emerald-600 transition-colors block"
                href="/terms-of-service#65-refunds-chargebacks"
              >
                Refund Policy
              </Link>
              <Link
                className="text-base text-gray-600 hover:text-emerald-600 transition-colors block"
                href="/terms-of-service#3-eligibility-accounts"
              >
                Eligibility &amp; Verification Policy
              </Link>
              <Link className="text-base text-gray-600 hover:text-emerald-600 transition-colors block" href="/cookie-policy">
                Cookie Policy
              </Link>
              <CookieSettingsButton className="text-left text-base text-gray-600 hover:text-emerald-600 transition-colors block w-full" />
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-gray-100 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-sm text-gray-500 shrink-0">
            © {new Date().getFullYear()} Replaceme. All rights reserved.
          </p>
          <div className="text-xs text-gray-400 text-center sm:text-right max-w-2xl space-y-2 leading-relaxed">
            <p>
              Employer subscription payments are processed securely by{" "}
              <a
                href="https://stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-emerald-600 transition-colors"
              >
                Stripe
              </a>
              . Replaceme is the merchant of record for standard Stripe Billing subscriptions.
              Recurring charges, cancellations, and refunds are governed by our{" "}
              <Link
                href="/terms-of-service#6-payments"
                className="underline hover:text-emerald-600 transition-colors"
              >
                Billing &amp; Payment Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/terms-of-service#65-refunds-chargebacks"
                className="underline hover:text-emerald-600 transition-colors"
              >
                Refund Policy
              </Link>
              .
            </p>
            <p>
              Platform work and identity verification are strictly restricted to citizens of the
              Philippines. See our{" "}
              <Link
                href="/terms-of-service#3-eligibility-accounts"
                className="underline hover:text-emerald-600 transition-colors"
              >
                Eligibility &amp; Verification Policy
              </Link>
              . We do not collect employer TIN/EIN numbers. See our{" "}
              <Link href="/privacy-policy" className="underline hover:text-emerald-600 transition-colors">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms-of-service" className="underline hover:text-emerald-600 transition-colors">
                Terms
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

