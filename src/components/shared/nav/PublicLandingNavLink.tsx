"use client";

import { Link as ScrollLink } from "react-scroll";
import { PUBLIC_HEADER_SCROLL_OFFSET } from "@/lib/layout/public-shell";

interface PublicLandingNavLinkProps {
  to: string;
  label: string;
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
  showUnderline?: boolean;
}

export function PublicLandingNavLink({
  to,
  label,
  className = "",
  isActive = false,
  onClick,
  showUnderline = true,
}: PublicLandingNavLinkProps) {
  return (
    <ScrollLink
      to={to}
      smooth
      offset={-PUBLIC_HEADER_SCROLL_OFFSET}
      duration={400}
      onClick={onClick}
      className={`public-nav-link group relative cursor-pointer transition-colors duration-200 ${
        isActive ? "public-nav-active" : ""
      } ${className}`}
    >
      <span className="inline-flex items-center gap-1.5">{label}</span>
      {showUnderline ? (
        <span className="public-nav-underline absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#22c55e] transition-transform duration-300 origin-left scale-x-0" />
      ) : null}
    </ScrollLink>
  );
}
