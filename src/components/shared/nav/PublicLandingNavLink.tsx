"use client";

import { Link as ScrollLink } from "react-scroll";
import { PUBLIC_HEADER_SCROLL_OFFSET } from "@/lib/layout/public-shell";

interface PublicLandingNavLinkProps {
  to: string;
  label: string;
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function PublicLandingNavLink({
  to,
  label,
  className = "",
  isActive = false,
  onClick,
}: PublicLandingNavLinkProps) {
  return (
    <ScrollLink
      to={to}
      smooth
      offset={-PUBLIC_HEADER_SCROLL_OFFSET}
      duration={500}
      onClick={onClick}
      className={`group relative py-1 font-semibold text-sm transition-colors duration-200 cursor-pointer ${
        isActive ? "text-[#22c55e]" : "text-[#475569] hover:text-[#22c55e]"
      } ${className}`}
    >
      <span className="inline-flex items-center gap-1.5">{label}</span>
      <span
        className={`absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#22c55e] transition-transform duration-300 origin-left ${
          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"
        }`}
      />
    </ScrollLink>
  );
}
