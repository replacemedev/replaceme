"use client";

import { EmployerBottomTabBar } from "./EmployerBottomTabBar";

interface EmployerLayoutChromeProps {
  unreadMessageCount?: number;
}

export function EmployerLayoutChrome({
  unreadMessageCount = 0,
}: EmployerLayoutChromeProps) {
  return <EmployerBottomTabBar unreadMessageCount={unreadMessageCount} />;
}
