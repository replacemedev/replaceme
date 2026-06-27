"use client";

import { WorkerBottomTabBar } from "./WorkerBottomTabBar";

interface WorkerLayoutChromeProps {
  unreadMessageCount?: number;
}

export function WorkerLayoutChrome({
  unreadMessageCount = 0,
}: WorkerLayoutChromeProps) {
  return <WorkerBottomTabBar unreadMessageCount={unreadMessageCount} />;
}
