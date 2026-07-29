"use client";

import { WorkerBottomTabBar } from "./WorkerBottomTabBar";
import { ScrollToTopOnNavigate } from "@/components/shared/layout/ScrollToTopOnNavigate";

interface WorkerLayoutChromeProps {
  unreadMessageCount?: number;
}

export function WorkerLayoutChrome({
  unreadMessageCount = 0,
}: WorkerLayoutChromeProps) {
  return (
    <>
      <ScrollToTopOnNavigate />
      <WorkerBottomTabBar unreadMessageCount={unreadMessageCount} />
    </>
  );
}
