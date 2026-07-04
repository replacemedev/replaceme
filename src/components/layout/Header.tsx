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
      setMobileMenuOpen(false);
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

  const landingNavLinks = GUEST_HEADER_NAV.map((item) => (
    <PublicLandingNavLink
      key={item.id}
      to={item.id}
      label={item.label}
      isActive={activeSection === item.id}
      onClick={() => handleSectionClick(item.id)}
      className="py-1 font-body-base"
    />
  ));

  const landingMobileNavLinks = GUEST_HEADER_NAV.map((item) => (
    <PublicLandingNavLink
      key={item.id}
      to={item.id}
      label={item.label}
      isActive={activeSection === item.id}
      onClick={() => {
        handleSectionClick(item.id);
        closeMobileMenu();
      }}
      className="py-2.5 px-3 text-sm font-medium text-slate-700 rounded-lg transition-all duration-200 active:scale-[0.98] active:bg-slate-50"
    />
  ));

  const guestAuthActions = (
    <>
      <Link
        className="text-[#475569] font-body-bold hover:text-[#22c55e] transition-colors"
        href="/signin"
        onClick={closeMobileMenu}
      >
        Sign In
      </Link>
      <Link
        className="bg-[#22c55e] text-white px-5 py-2 rounded-xl font-body-bold hover:bg-[#16a34a] transition-all duration-200 shadow-sm text-sm"
        href="/signup"
        onClick={closeMobileMenu}
      >
        Get Started
      </Link>
    </>
  );

  const guestMobileAuthActions = (
    <>
      <Link
        onClick={closeMobileMenu}
        className="text-slate-700 font-body-bold py-2.5 text-center text-sm rounded-lg transition-all duration-200 hover:text-[#22c55e] active:scale-[0.98] active:bg-slate-50"
        href="/signin"
      >
        Sign In
      </Link>
      <Link
        onClick={closeMobileMenu}
        className="bg-[#22c55e] text-white text-center py-2.5 rounded-xl font-body-bold text-sm transition-transform duration-200 active:scale-[0.98]"
        href="/signup"
      >
        Get Started
      </Link>
    </>
  );

  const showMobileMenuButton =
    isLandingPage || !session.isAuthenticated;

  return (
    <header className="sticky top-0 w-full z-50 bg-white border-b border-slate-100 shadow-sm">
      <div
        className={`px-4 md:px-margin-desktop max-w-container-max mx-auto w-full h-16 items-center ${
          isLandingPage
            ? "flex justify-between lg:grid lg:grid-cols-[1fr_auto_1fr]"
            : "flex justify-between"
        }`}
      >
        <NavBrand homeHref="/" compact />

        {isLandingPage ? (
          <nav className="hidden lg:flex items-center justify-self-center gap-6 lg:gap-8">
            {landingNavLinks}
          </nav>
        ) : null}

        <div
          className={`hidden lg:flex items-center gap-6 ${
            isLandingPage ? "justify-self-end" : "ml-auto"
          }`}
        >
          {session.isAuthenticated ? (
            <PublicAuthenticatedNavActions session={session} />
          ) : (
            guestAuthActions
          )}
        </div>

        {!showMobileMenuButton && session.isAuthenticated ? (
          <div className="lg:hidden flex items-center gap-3 ml-auto">
            <PublicAuthenticatedNavActions session={session} />
          </div>
        ) : null}

        {showMobileMenuButton ? (
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden relative flex h-9 w-9 items-center justify-center rounded-lg text-on-surface transition-colors duration-200 hover:bg-slate-50 hover:text-[#22c55e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e]/30 ml-auto"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <Menu
              className={`absolute h-5 w-5 transition-all duration-300 ease-out ${
                mobileMenuOpen
                  ? "scale-75 rotate-90 opacity-0"
                  : "scale-100 rotate-0 opacity-100"
              }`}
              aria-hidden
            />
            <X
              className={`absolute h-5 w-5 transition-all duration-300 ease-out ${
                mobileMenuOpen
                  ? "scale-100 rotate-0 opacity-100"
                  : "scale-75 -rotate-90 opacity-0"
              }`}
              aria-hidden
            />
          </button>
        ) : null}
      </div>

      {showMobileMenuButton ? (
        <div
          className={`lg:hidden absolute top-full left-0 z-40 w-full ${
            mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
          aria-hidden={!mobileMenuOpen}
        >
          <div
            className={`flex flex-col gap-2 border-b border-slate-100 bg-white px-4 py-3 shadow-lg origin-top transition-all duration-300 ease-out ${
              mobileMenuOpen
                ? "translate-y-0 scale-100 opacity-100"
                : "-translate-y-1 scale-[0.98] opacity-0"
            }`}
          >
            {isLandingPage ? landingMobileNavLinks : null}
            {isLandingPage ? <hr className="my-1 border-slate-100" /> : null}
            {session.isAuthenticated ? (
              <PublicAuthenticatedNavActions
                session={session}
                layout="mobile"
                onNavigate={closeMobileMenu}
              />
            ) : (
              guestMobileAuthActions
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
