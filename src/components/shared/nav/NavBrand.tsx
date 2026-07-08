import Image from "next/image";
import Link from "next/link";

interface NavBrandProps {
  homeHref: string;
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}

export function NavBrand({ homeHref, compact = false, onClick, className = "" }: NavBrandProps) {
  return (
    <Link
      href={homeHref}
      onClick={onClick}
      className={`flex items-center gap-1.5 transition-transform duration-200 hover:opacity-90 ${className}`}
    >
      <div
        className={`relative shrink-0 ${compact ? "w-8 h-8 sm:w-9 sm:h-9" : "w-10 h-10 sm:w-12 sm:h-12"}`}
      >
        <Image
          src="/images/logo.png"
          alt="Replace Me Logo"
          fill
          className="object-contain"
          sizes={compact ? "36px" : "48px"}
          priority
        />
      </div>
      <span
        className={`-translate-y-[2px] font-display-md font-bold text-[#0a4a29] truncate ${compact ? "text-[15px] sm:text-lg" : "text-xl sm:text-2xl"
          }`}
      >
        Replace Me
      </span>
    </Link>
  );
}
