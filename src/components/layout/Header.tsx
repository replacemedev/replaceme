"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavBrand } from "@/components/shared/nav/NavBrand";
import { NavUnderlineLink } from "@/components/shared/nav/NavUnderlineLink";
import { AuthenticatedNavActions } from "@/components/shared/nav/AuthenticatedNavActions";
import { GUEST_NAV_SESSION, type NavSession } from "@/types/nav";
import { PUBLIC_GROWTH_NAV } from "@/config/publicNav";

interface HeaderProps {
  session?: NavSession;
}

export function Header({ session = GUEST_NAV_SESSION }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hash, setHash] = useState("");
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  const getHref = (id: string) => (isLandingPage ? `#${id}` : `/#${id}`);

  const isAnchorActive = (id: string) => isLandingPage && hash === `#${id}`;

  return (
    <header className="sticky top-0 w-full z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="flex justify-between items-center px-margin-desktop max-w-container-max mx-auto w-full h-16">
        <NavBrand homeHref={session.homeHref} compact />

        {/* Desktop Navigation — marketing links for guests; compact for authenticated */}
        {!session.isAuthenticated && (
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {PUBLIC_GROWTH_NAV.map((item) => (
            <NavUnderlineLink
              key={item.href}
              href={item.href}
              label={item.label}
              variant="public"
              className="font-body-base"
              isActive={
                pathname === item.href || pathname.startsWith(`${item.href}/`)
              }
            />
          ))}
          <NavUnderlineLink
            href={getHref("how-it-works")}
            label="How it Works"
            variant="public"
            className="font-body-base"
            isActive={isAnchorActive("how-it-works")}
          />
          <NavUnderlineLink
            href={getHref("faq")}
            label="FAQ"
            variant="public"
            className="font-body-base"
            isActive={isAnchorActive("faq")}
          />
        </nav>
        )}

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6">
          {session.isAuthenticated ? (
            <AuthenticatedNavActions session={session} />
          ) : (
            <>
          <Link
            className="text-[#475569] font-body-bold hover:text-[#22c55e] transition-colors"
            href="/login"
          >
            Sign In
          </Link>
          <Link
            className="bg-[#22c55e] text-white px-5 py-2 rounded-xl font-body-bold hover:bg-[#16a34a] transition-all duration-200 shadow-sm text-sm"
            href="/signup"
          >
            Get Started
          </Link>
            </>
          )}
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
          {!session.isAuthenticated ? (
            <>
          {PUBLIC_GROWTH_NAV.map((item) => (
            <Link
              key={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`font-medium py-2 transition-colors duration-200 ${
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "text-[#22c55e]"
                  : "text-slate-700 hover:text-[#22c55e]"
              }`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link
            onClick={() => setMobileMenuOpen(false)}
            className={`font-medium py-2 transition-colors duration-200 ${
              isAnchorActive("how-it-works")
                ? "text-[#22c55e]"
                : "text-slate-700 hover:text-[#22c55e]"
            }`}
            href={getHref("how-it-works")}
          >
            How it Works
          </Link>
          <Link
            onClick={() => setMobileMenuOpen(false)}
            className={`font-medium py-2 transition-colors duration-200 ${
              isAnchorActive("faq")
                ? "text-[#22c55e]"
                : "text-slate-700 hover:text-[#22c55e]"
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
            </>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              <AuthenticatedNavActions session={session} />
              <Link
                href={session.homeHref}
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-sm font-bold text-[#006e2f] py-2"
              >
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
