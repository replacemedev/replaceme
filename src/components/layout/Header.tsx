"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NavBrand } from "@/components/shared/nav/NavBrand";
import { NavUnderlineLink } from "@/components/shared/nav/NavUnderlineLink";
import { PublicAuthenticatedNavActions } from "@/components/shared/nav/PublicAuthenticatedNavActions";
import { GUEST_NAV_SESSION, type NavSession } from "@/types/nav";
import { GUEST_HEADER_NAV } from "@/config/publicNav";

interface HeaderProps {
  session?: NavSession;
}

const GUEST_SECTION_IDS = new Set(GUEST_HEADER_NAV.map((item) => item.id));

function isGuestSectionId(id: string): id is (typeof GUEST_HEADER_NAV)[number]["id"] {
  return GUEST_SECTION_IDS.has(id as (typeof GUEST_HEADER_NAV)[number]["id"]);
}

export function Header({ session = GUEST_NAV_SESSION }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  useEffect(() => {
    if (!isLandingPage) {
      setActiveSection("");
      return;
    }

    const syncFromHash = () => {
      const id = window.location.hash.replace("#", "");
      setActiveSection(isGuestSectionId(id) ? id : "");
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [isLandingPage, pathname]);

  const getAnchorHref = (id: string) => (isLandingPage ? `#${id}` : `/#${id}`);

  const selectSection = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  const isAnchorActive = (id: string) => isLandingPage && activeSection === id;

  const marketingNavLinks = GUEST_HEADER_NAV.map((item) => (
    <NavUnderlineLink
      key={item.id}
      href={getAnchorHref(item.id)}
      label={item.label}
      variant="public"
      className="font-body-base"
      isActive={isAnchorActive(item.id)}
      onClick={() => selectSection(item.id)}
    />
  ));

  const marketingMobileLinks = GUEST_HEADER_NAV.map((item) => (
    <Link
      key={item.id}
      onClick={() => selectSection(item.id)}
      className={`relative py-2 font-medium transition-colors duration-200 ${
        isAnchorActive(item.id)
          ? "text-[#22c55e]"
          : "text-slate-700 hover:text-[#22c55e]"
      }`}
      href={getAnchorHref(item.id)}
    >
      {item.label}
      <span
        className={`absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#22c55e] transition-transform duration-300 origin-left ${
          isAnchorActive(item.id) ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </Link>
  ));

  return (
    <header className="sticky top-0 w-full z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="flex justify-between items-center px-margin-desktop max-w-container-max mx-auto w-full h-16">
        <NavBrand homeHref="/" compact />

        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {marketingNavLinks}
        </nav>

        <div className="hidden md:flex items-center gap-6">
          {session.isAuthenticated ? (
            <PublicAuthenticatedNavActions session={session} />
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

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center p-2 text-on-surface hover:text-[#22c55e] focus:outline-none"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? (
            <X className="h-7 w-7" aria-hidden />
          ) : (
            <Menu className="h-7 w-7" aria-hidden />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 flex flex-col p-6 gap-4 shadow-xl animate-fadeIn">
          {marketingMobileLinks}
          <hr className="border-slate-100 my-2" />
          {session.isAuthenticated ? (
            <PublicAuthenticatedNavActions
              session={session}
              layout="mobile"
              onNavigate={() => setMobileMenuOpen(false)}
            />
          ) : (
            <>
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
          )}
        </div>
      )}
    </header>
  );
}
