"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WORKER_NAV_ITEMS } from "@/config/workerNav";

export function WorkerDesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
      {WORKER_NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`font-semibold text-sm transition-colors duration-200 ${
              isActive
                ? "text-[#006e2f]"
                : "text-slate-600 hover:text-[#006e2f]"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
