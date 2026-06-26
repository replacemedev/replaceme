"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NavBrand } from "@/components/shared/nav/NavBrand";
import { PublicLandingNavLink } from "@/components/shared/nav/PublicLandingNavLink";
import { PublicAuthenticatedNavActions } from "@/components/shared/nav/PublicAuthenticatedNavActions";
import { GUEST_NAV_SESSION, type NavSession } from "@/types/nav";
import { GUEST_HEADER_NAV } from "@/config/publicNav";

interface HeaderProps {
  session?: NavSession;
}

function getHashSection(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace("#", "");
  return GUEST_HEADER_NAV.some((item) => item.id === hash) ? hash : null;
}

export function Header({ session = GUEST_NAV_SESSION }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  useEffect(() => {
    if (!isLandingPage) {
      setActiveSection(null);
      return;
    }

    setActiveSection(getHashSection());

    const onHashChange = () => setActiveSection(getHashSection());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [isLandingPage, pathname]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleSectionClick = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    window.history.replaceState(null, "", `#${sectionId}`);
  }, []);

  const marketingNavLinks = GUEST_HEADER_NAV.map((item) =>
    isLandingPage ? (
      <PublicLandingNavLink
        key={item.id}
        to={item.id}
        label={item.label}
        isActive={activeSection === item.id}
        onClick={() => handleSectionClick(item.id)}
        className="py-1 font-body-base font-semibold text-sm text-[#475569]"
      />
    ) : (
      <Link
        key={item.id}
        href={`/#${item.id}`}
        className="relative py-1 font-body-base font-semibold text-sm text-[#475569] hover:text-[#22c55e] transition-colors duration-200"
      >
        {item.label}
      </Link>
    )
  );

  const marketingMobileLinks = GUEST_HEADER_NAV.map((item) =>
    isLandingPage ? (
      <PublicLandingNavLink
        key={item.id}
        to={item.id}
        label={item.label}
        isActive={activeSection === item.id}
        onClick={() => {
          handleSectionClick(item.id);
          closeMobileMenu();
        }}
        className="py-2 font-medium text-slate-700"
      />
    ) : (
      <Link
        key={item.id}
        href={`/#${item.id}`}
        onClick={closeMobileMenu}
        className="font-medium py-2 text-slate-700 hover:text-[#22c55e] transition-colors duration-200"
      >
        {item.label}
      </Link>
    )
  );

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
              onNavigate={closeMobileMenu}
            />
          ) : (
            <>
              <Link
                onClick={closeMobileMenu}
                className="text-slate-700 font-body-bold py-2 text-center hover:text-[#22c55e]"
                href="/login"
              >
                Sign In
              </Link>
              <Link
                onClick={closeMobileMenu}
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
