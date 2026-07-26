import React from "react";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/shared/cookie-consent";
import { NavBrand } from "@/components/shared/nav/NavBrand";

const linkClassName =
  "text-base text-gray-600 hover:text-emerald-600 transition-colors block";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-12 md:py-16 relative overflow-hidden">
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-30 pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Zone — Link Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-1 xl:col-span-2 max-w-xs mb-2 lg:mb-0">
            <NavBrand homeHref="/" />
            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
              Empowering global teams with elite Filipino remote talent. Building
              direct connections for long-term success.
            </p>
          </div>

          {/* Employers */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-950 uppercase tracking-wider mb-4">
              Employers
            </h3>
            <nav className="space-y-3" aria-label="Employer links">
              <Link className={linkClassName} href="/signup">
                Post a Job
              </Link>
              <Link className={linkClassName} href="/help/hiring-guide">
                Hiring Guide
              </Link>
              <Link className={linkClassName} href="/pricing">
                Pricing
              </Link>
              <Link className={linkClassName} href="/faq/employer">
                Employer FAQs
              </Link>
            </nav>
          </div>

          {/* Jobseekers */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-950 uppercase tracking-wider mb-4">
              Jobseekers
            </h3>
            <nav className="space-y-3" aria-label="Jobseeker links">
              <Link className={linkClassName} href="/jobs">
                Browse Jobs
              </Link>
              <Link className={linkClassName} href="/signup">
                Create Profile
              </Link>
              <Link className={linkClassName} href="/faq/worker">
                Worker FAQs
              </Link>
            </nav>
          </div>

          {/* Company & Legal */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-950 uppercase tracking-wider mb-4">
              Company &amp; Legal
            </h3>
            <nav className="space-y-3" aria-label="Company and legal links">
              <Link className={linkClassName} href="/team">
                Our Team
              </Link>
              <Link className={linkClassName} href="/help">
                Help Center
              </Link>
              <Link className={linkClassName} href="/contact">
                Contact Us
              </Link>
              <Link className={linkClassName} href="/privacy-policy">
                Privacy Policy
              </Link>
              <Link className={linkClassName} href="/subprocessors">
                Subprocessors
              </Link>
              <Link className={linkClassName} href="/employer-dpa">
                Employer DPA
              </Link>
              <Link className={linkClassName} href="/terms-of-service">
                Terms of Service
              </Link>
              <Link className={linkClassName} href="/cookie-policy">
                Cookie Policy
              </Link>
              <CookieSettingsButton className="text-left text-base text-gray-600 hover:text-emerald-600 transition-colors block w-full" />
            </nav>
          </div>
        </div>

        {/* Bottom Zone — Fine Print */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-gray-100 flex flex-col items-center gap-3 text-center md:flex-row md:items-end md:justify-between md:text-left md:gap-6">
          <p className="text-sm text-gray-500 shrink-0">
            © {new Date().getFullYear()} Replaceme. All rights reserved.
          </p>
          <div className="text-xs text-gray-500 max-w-xl w-full md:max-w-md lg:max-w-lg md:text-right space-y-1.5 leading-relaxed break-words">
            <p>
              Payments processed securely by Stripe. Replaceme is the merchant of
              record for all subscriptions.
            </p>
            <p>
              Platform work and identity verification are strictly restricted to
              citizens of the Philippines. We do not collect employer TIN/EIN,
              date of birth, gender, civil status, or personal home address. See
              our{" "}
              <Link
                href="/privacy-policy"
                className="underline hover:text-emerald-600 transition-colors"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/employer-dpa"
                className="underline hover:text-emerald-600 transition-colors"
              >
                Employer DPA
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
