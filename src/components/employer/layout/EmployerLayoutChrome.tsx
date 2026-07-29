"use client";

import { EmployerBottomTabBar } from "./EmployerBottomTabBar";
import { ScrollToTopOnNavigate } from "@/components/shared/layout/ScrollToTopOnNavigate";
import type { NavSession } from "@/types/nav";

interface EmployerLayoutChromeProps {
  unreadMessageCount?: number;
  session?: NavSession;
}

export function EmployerLayoutChrome({
  unreadMessageCount = 0,
  session,
}: EmployerLayoutChromeProps) {
  return (
    <>
      <ScrollToTopOnNavigate />
      <EmployerBottomTabBar unreadMessageCount={unreadMessageCount} session={session} />
    </>
  );
}
