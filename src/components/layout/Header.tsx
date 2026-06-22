"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getHref = (id: string) => {
    return isLandingPage ? `#${id}` : `/#${id}`;
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 bg-white border-b border-slate-100 ${
        isScrolled ? "py-2.5 shadow-sm" : "py-4"
      }`}
    >
      <div className="flex justify-between items-center px-margin-desktop max-w-container-max mx-auto w-full">
        {/* Brand */}
        <Link
          onClick={() => setActiveSection("")}
          className="flex items-center gap-3 transition-transform duration-200 hover:opacity-90 scale-102"
          href="/"
        >
          <div className="relative w-12 h-12 shrink-0">
            <Image
              src="/images/logo_favicon.png"
              alt="Replace Me Logo"
              fill
              className="object-contain"
              sizes="48px"
              priority
            />
          </div>
          <span className="font-display-md text-2xl font-bold text-[#0a4a29] leading-none relative top-[-4px]">
            Replace Me
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            onClick={() => setActiveSection("top-talent")}
            className={`relative py-1.5 font-body-base font-semibold transition-colors duration-200 ${
              activeSection === "top-talent" ? "text-[#22c55e]" : "text-[#475569] hover:text-[#22c55e]"
            }`}
            href={getHref("top-talent")}
          >
            Find Talent
            <span
              className={`absolute bottom-0 left-0 w-full h-[2.5px] bg-[#22c55e] rounded-full transition-transform duration-300 origin-left ${
                activeSection === "top-talent" ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </Link>
          <Link
            onClick={() => setActiveSection("find-work")}
            className={`relative py-1.5 font-body-base font-semibold transition-colors duration-200 ${
              activeSection === "find-work" ? "text-[#22c55e]" : "text-[#475569] hover:text-[#22c55e]"
            }`}
            href={getHref("find-work")}
          >
            Find Work
            <span
              className={`absolute bottom-0 left-0 w-full h-[2.5px] bg-[#22c55e] rounded-full transition-transform duration-300 origin-left ${
                activeSection === "find-work" ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </Link>
          <Link
            onClick={() => setActiveSection("how-it-works")}
            className={`relative py-1.5 font-body-base font-semibold transition-colors duration-200 ${
              activeSection === "how-it-works" ? "text-[#22c55e]" : "text-[#475569] hover:text-[#22c55e]"
            }`}
            href={getHref("how-it-works")}
          >
            How it Works
            <span
              className={`absolute bottom-0 left-0 w-full h-[2.5px] bg-[#22c55e] rounded-full transition-transform duration-300 origin-left ${
                activeSection === "how-it-works" ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </Link>
          <Link
            onClick={() => setActiveSection("pricing")}
            className={`relative py-1.5 font-body-base font-semibold transition-colors duration-200 ${
              activeSection === "pricing" ? "text-[#22c55e]" : "text-[#475569] hover:text-[#22c55e]"
            }`}
            href={getHref("pricing")}
          >
            Pricing
            <span
              className={`absolute bottom-0 left-0 w-full h-[2.5px] bg-[#22c55e] rounded-full transition-transform duration-300 origin-left ${
                activeSection === "pricing" ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </Link>
          <Link
            onClick={() => setActiveSection("faq")}
            className={`relative py-1.5 font-body-base font-semibold transition-colors duration-200 ${
              activeSection === "faq" ? "text-[#22c55e]" : "text-[#475569] hover:text-[#22c55e]"
            }`}
            href={getHref("faq")}
          >
            FAQ
            <span
              className={`absolute bottom-0 left-0 w-full h-[2.5px] bg-[#22c55e] rounded-full transition-transform duration-300 origin-left ${
                activeSection === "faq" ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            className="text-[#475569] font-body-bold hover:text-[#22c55e] transition-colors"
            href="/login"
          >
            Sign In
          </Link>
          <Link
            className="bg-[#22c55e] text-white px-6 py-2.5 rounded-xl font-body-bold hover:bg-[#16a34a] hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
            href="/signup"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center p-2 text-on-surface hover:text-[#22c55e] focus:outline-none"
          aria-label="Toggle Menu"
        >
          <span className="material-symbols-outlined text-3xl">
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 flex flex-col p-6 gap-4 shadow-xl animate-fadeIn">
          <Link
            onClick={() => {
              setMobileMenuOpen(false);
              setActiveSection("top-talent");
            }}
            className={`font-medium py-2 transition-colors duration-200 ${
              activeSection === "top-talent" ? "text-[#22c55e]" : "text-slate-700 hover:text-[#22c55e]"
            }`}
            href={getHref("top-talent")}
          >
            Find Talent
          </Link>
          <Link
            onClick={() => {
              setMobileMenuOpen(false);
              setActiveSection("find-work");
            }}
            className={`font-medium py-2 transition-colors duration-200 ${
              activeSection === "find-work" ? "text-[#22c55e]" : "text-slate-700 hover:text-[#22c55e]"
            }`}
            href={getHref("find-work")}
          >
            Find Work
          </Link>
          <Link
            onClick={() => {
              setMobileMenuOpen(false);
              setActiveSection("how-it-works");
            }}
            className={`font-medium py-2 transition-colors duration-200 ${
              activeSection === "how-it-works" ? "text-[#22c55e]" : "text-slate-700 hover:text-[#22c55e]"
            }`}
            href={getHref("how-it-works")}
          >
            How it Works
          </Link>
          <Link
            onClick={() => {
              setMobileMenuOpen(false);
              setActiveSection("pricing");
            }}
            className={`font-medium py-2 transition-colors duration-200 ${
              activeSection === "pricing" ? "text-[#22c55e]" : "text-slate-700 hover:text-[#22c55e]"
            }`}
            href={getHref("pricing")}
          >
            Pricing
          </Link>
          <Link
            onClick={() => {
              setMobileMenuOpen(false);
              setActiveSection("faq");
            }}
            className={`font-medium py-2 transition-colors duration-200 ${
              activeSection === "faq" ? "text-[#22c55e]" : "text-slate-700 hover:text-[#22c55e]"
            }`}
            href={getHref("faq")}
          >
            FAQ
          </Link>
          <hr className="border-slate-100 my-2" />
          <Link
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-700 font-body-bold py-2 text-center hover:text-[#22c55e]"
            href="/login"
          >
            Sign In
          </Link>
          <Link
            onClick={() => setMobileMenuOpen(false)}
            className="bg-[#22c55e] text-white text-center py-3 rounded-xl font-body-bold"
            href="/signup"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
