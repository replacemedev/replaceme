"use client";

import { ReactNode } from "react";

interface JobCardGridProps {
  children: ReactNode;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function JobCardGrid({
  children,
}: JobCardGridProps) {
  return (
    <section>
      <ul className="flex flex-col gap-6 w-full">{children}</ul>
    </section>
  );
}
