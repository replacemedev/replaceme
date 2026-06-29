import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  AUTH_CARD,
  AUTH_FORM_MAX,
  AUTH_MARKETING_DESKTOP,
  AUTH_MARKETING_MOBILE,
  AUTH_PANEL_PADDING,
} from "@/lib/auth/ui-tokens";

interface AuthPageShellProps {
  children: ReactNode;
  marketing?: ReactNode;
  marketingPosition?: "left" | "right";
  footer?: ReactNode;
  brandHref?: string;
}

export function AuthPageShell({
  children,
  marketing,
  marketingPosition = "right",
  footer,
  brandHref = "/",
}: AuthPageShellProps) {
  const marketingPanel = marketing ? (
    <>
      <div
        className={`${AUTH_MARKETING_DESKTOP} ${
          marketingPosition === "left"
            ? "bg-[#005321] order-first"
            : "bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100"
        }`}
      >
        {marketing}
      </div>
      <div className={AUTH_MARKETING_MOBILE}>{marketing}</div>
    </>
  ) : null;

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f8fafe] lg:flex-row">
      {marketingPosition === "left" ? marketingPanel : null}

      <div
        className={`flex w-full flex-1 flex-col justify-between min-h-screen ${AUTH_PANEL_PADDING} lg:w-1/2`}
      >
        <div
          className={`flex flex-1 flex-col justify-center w-full ${AUTH_FORM_MAX} mx-auto py-6 sm:py-8`}
        >
          <Link
            href={brandHref}
            className="mb-6 inline-flex items-center gap-2 transition-opacity hover:opacity-90 w-fit"
          >
            <div className="relative h-8 w-8 shrink-0">
              <Image
                src="/images/logo_favicon.png"
                alt="Replace Me"
                fill
                className="object-contain"
                sizes="32px"
                priority
              />
            </div>
            <span className="relative top-[-1px] font-display-md text-xl font-bold leading-none text-slate-900">
              Replace Me
            </span>
          </Link>
          {children}
        </div>
        {footer}
      </div>

      {marketingPosition === "right" ? marketingPanel : null}
    </div>
  );
}

export function AuthFormCard({ children }: { children: ReactNode }) {
  return <div className={AUTH_CARD}>{children}</div>;
}
