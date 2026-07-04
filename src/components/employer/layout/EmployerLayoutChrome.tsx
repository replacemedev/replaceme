"use client";

import { EmployerBottomTabBar } from "./EmployerBottomTabBar";
import type { NavSession } from "@/types/nav";

interface EmployerLayoutChromeProps {
  unreadMessageCount?: number;
  session?: NavSession;
}

export function EmployerLayoutChrome({
  unreadMessageCount = 0,
  session,
}: EmployerLayoutChromeProps) {
  return <EmployerBottomTabBar unreadMessageCount={unreadMessageCount} session={session} />;
}
