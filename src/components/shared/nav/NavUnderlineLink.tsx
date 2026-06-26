"use client";

import Link from "next/link";

const ACCENT = {
  brand: {
    active: "text-[#006e2f]",
    idle: "text-slate-600 hover:text-[#006e2f]",
    bar: "bg-[#006e2f]",
  },
  public: {
    active: "text-[#22c55e]",
    idle: "text-[#475569] hover:text-[#22c55e]",
    bar: "bg-[#22c55e]",
  },
} as const;

type AccentKey = keyof typeof ACCENT;

interface NavUnderlineLinkProps {
  href: string;
  label: string;
  isActive: boolean;
  variant?: AccentKey;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function NavUnderlineLink({
  href,
  label,
  isActive,
  variant = "brand",
  className = "",
  onClick,
  children,
}: NavUnderlineLinkProps) {
  const tone = ACCENT[variant];

  const hoverUnderline =
    variant === "public" ? "group-hover:scale-x-100 group-focus-visible:scale-x-100" : "";

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`group relative py-1 font-semibold text-sm transition-colors duration-200 ${
        isActive ? tone.active : tone.idle
      } ${className}`}
    >
      <span className="inline-flex items-center gap-1.5">
        {label}
        {children}
      </span>
      <span
        className={`absolute bottom-0 left-0 h-0.5 w-full rounded-full transition-transform duration-300 origin-left ${tone.bar} ${
          isActive ? "scale-x-100" : `scale-x-0 ${hoverUnderline}`
        }`}
      />
    </Link>
  );
}

interface NavUnderlineButtonProps {
  label: string;
  isActive: boolean;
  isOpen: boolean;
  variant?: AccentKey;
  onClick: () => void;
  children?: React.ReactNode;
}

export function NavUnderlineButton({
  label,
  isActive,
  isOpen,
  variant = "brand",
  onClick,
  children,
}: NavUnderlineButtonProps) {
  const tone = ACCENT[variant];
  const highlighted = isActive || isOpen;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative py-1 font-semibold text-sm transition-colors duration-200 flex items-center gap-1 cursor-pointer ${
        highlighted ? tone.active : tone.idle
      }`}
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      {label}
      {children}
      <span
        className={`absolute bottom-0 left-0 h-0.5 w-full rounded-full transition-transform duration-300 origin-left ${tone.bar} ${
          highlighted ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </button>
  );
}
