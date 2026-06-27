"use client";

import React from "react";
import { HiredWorker } from "@/types/employer/hired";
import { HiredWorkerCard } from "./HiredWorkerCard";

interface HiredWorkerListProps {
  workers: HiredWorker[];
  planSlug: string;
  messagingEnabled?: boolean;
}

export function HiredWorkerList({
  workers,
  planSlug,
  messagingEnabled = true,
}: HiredWorkerListProps) {
  if (workers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {workers.map((worker) => (
        <HiredWorkerCard
          key={worker.id}
          worker={worker}
          planSlug={planSlug}
          messagingEnabled={messagingEnabled}
        />
      ))}
    </div>
  );
}
