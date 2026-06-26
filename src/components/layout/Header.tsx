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

const GUEST_SECTION_IDS = GUEST_HEADER_NAV.map((item) => item.id);

export function Header({ session = GUEST_NAV_SESSION }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [landingSection, setLandingSection] = useState("");
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  useEffect(() => {
    if (!isLandingPage) {
      setLandingSection("");
      return;
    }

    const syncFromHash = () => {
      const id = window.location.hash.replace("#", "");
      setLandingSection(
        GUEST_SECTION_IDS.includes(id as (typeof GUEST_SECTION_IDS)[number]) ? id : ""
      );
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);

    const observer = new IntersectionObserver(
      (entries) => {
        if (window.location.hash) return;

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setLandingSection(visible[0].target.id);
          return;
        }

        if (window.scrollY < 120) {
          setLandingSection("");
        }
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: 0.1 }
    );

    GUEST_SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      observer.disconnect();
    };
  }, [isLandingPage, pathname]);

  const getAnchorHref = (id: string) => (isLandingPage ? `#${id}` : `/#${id}`);

  const isAnchorActive = (id: string) => isLandingPage && landingSection === id;

  const marketingNavLinks = GUEST_HEADER_NAV.map((item) => (
    <NavUnderlineLink
      key={item.id}
      href={getAnchorHref(item.id)}
      label={item.label}
      variant="public"
      className="font-body-base"
      isActive={isAnchorActive(item.id)}
    />
  ));

  const marketingMobileLinks = GUEST_HEADER_NAV.map((item) => (
    <Link
      key={item.id}
      onClick={() => setMobileMenuOpen(false)}
      className={`font-medium py-2 transition-colors duration-200 ${
        isAnchorActive(item.id)
          ? "text-[#22c55e]"
          : "text-slate-700 hover:text-[#22c55e]"
      }`}
      href={getAnchorHref(item.id)}
    >
      {item.label}
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
