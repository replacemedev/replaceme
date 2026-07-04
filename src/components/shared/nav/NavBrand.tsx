import Image from "next/image";
import Link from "next/link";

interface NavBrandProps {
  homeHref: string;
  compact?: boolean;
}

export function NavBrand({ homeHref, compact = false }: NavBrandProps) {
  return (
    <Link
      href={homeHref}
      className="flex items-center gap-3 transition-transform duration-200 hover:opacity-90"
    >
      <div
        className={`relative shrink-0 ${compact ? "w-8 h-8 sm:w-9 sm:h-9" : "w-10 h-10 sm:w-12 sm:h-12"}`}
      >
        <Image
          src="/images/logo_favicon.png"
          alt="Replace Me home"
          fill
          className="object-contain"
          sizes={compact ? "36px" : "48px"}
          priority
        />
      </div>
      <span
        className={`font-display-md font-bold text-[#0a4a29] leading-none ${
          compact ? "text-sm sm:text-lg hidden min-[360px]:inline-block" : "text-xl sm:text-2xl"
        }`}
      >
        Replace Me
      </span>
    </Link>
  );
}
