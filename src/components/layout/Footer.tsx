import React from "react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white w-full py-20 border-t border-slate-100 relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-30 pointer-events-none z-0" />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-12 px-margin-desktop max-w-container-max mx-auto relative z-10">
        {/* Brand Column */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
          <Link className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity" href="/">
            <div className="relative w-12 h-12 shrink-0">
              <Image
                src="/images/logo_favicon.png"
                alt="Replace Me Logo"
                fill
                className="object-contain"
                sizes="48px"
              />
            </div>
            <span className="font-display-md text-2xl font-extrabold text-slate-800 leading-none relative top-[-4px]">
              Replace Me
            </span>
          </Link>
          <p className="text-slate-400 font-body-base text-sm mt-2 max-w-sm">
            Empowering global teams with elite Filipino remote talent. Building direct connections for long-term success.
          </p>
        </div>

        {/* Employer Links Column */}
        <div className="col-span-1 flex flex-col gap-4 text-sm">
          <h4 className="text-slate-800 font-body-bold font-bold text-base mb-1">Employers</h4>
          <Link className="text-slate-400 font-body-base hover:text-[#22c55e] transition-colors" href="/signup">
            Post a Job
          </Link>
          <Link className="text-slate-400 font-body-base hover:text-[#22c55e] transition-colors" href="/#pricing">
            Pricing
          </Link>
          <Link className="text-slate-400 font-body-base hover:text-[#22c55e] transition-colors" href="/#faq">
            Employer FAQs
          </Link>
        </div>

        {/* Jobseeker Links Column */}
        <div className="col-span-1 flex flex-col gap-4 text-sm">
          <h4 className="text-slate-800 font-body-bold font-bold text-base mb-1">Jobseekers</h4>
          <Link className="text-slate-400 font-body-base hover:text-[#22c55e] transition-colors" href="/#find-work">
            Browse Jobs
          </Link>
          <Link className="text-slate-400 font-body-base hover:text-[#22c55e] transition-colors" href="/signup">
            Create Profile
          </Link>
          <Link className="text-slate-400 font-body-base hover:text-[#22c55e] transition-colors" href="/#faq">
            Worker FAQs
          </Link>
        </div>

        {/* Legal & Support Column */}
        <div className="col-span-1 flex flex-col gap-4 text-sm">
          <h4 className="text-slate-800 font-body-bold font-bold text-base mb-1">Legal &amp; Support</h4>
          <Link className="text-slate-400 font-body-base hover:text-[#22c55e] transition-colors" href="/privacy-policy">
            Privacy Policy
          </Link>
          <Link className="text-slate-400 font-body-base hover:text-[#22c55e] transition-colors" href="/terms-of-service">
            Terms of Service
          </Link>
          <Link className="text-slate-400 font-body-base hover:text-[#22c55e] transition-colors" href="/contact">
            Contact Us
          </Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-16 pt-8 border-t border-slate-100 px-margin-desktop max-w-container-max mx-auto flex items-center justify-between relative z-10">
        <p className="text-slate-400 font-body-base text-sm">
          © {new Date().getFullYear()} Replace Me. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
