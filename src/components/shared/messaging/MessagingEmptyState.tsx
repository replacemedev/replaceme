"use client";

import { MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { featureGateCopy } from "@/lib/entitlements/ui-copy";
import type { MessagingRole } from "@/types/messaging";

interface MessagingEmptyStateProps {
  role?: MessagingRole;
  messagingEnabled?: boolean;
  planSlug?: string;
}

export function MessagingEmptyState({
  role = "worker",
  messagingEnabled = true,
  planSlug = "discovery",
}: MessagingEmptyStateProps) {
  if (role === "employer" && !messagingEnabled) {
    const copy = featureGateCopy("messaging", planSlug);
    return (
      <EmptyState
        icon={<MessageSquare size={22} aria-hidden />}
        title={copy.title}
        description={copy.description}
        actionLabel={`Upgrade to ${copy.tierLabel}`}
        actionHref={`/employer/checkout/${copy.tier}`}
      />
    );
  }

  if (role === "employer") {
    return (
      <EmptyState
        icon={<MessageSquare size={22} aria-hidden />}
        title="Select a conversation"
        description="Choose a candidate thread from your inbox to reply, share files, and move hiring forward."
        actionLabel="View job posts"
        actionHref="/employer/jobs"
      />
    );
  }

  return (
    <EmptyState
      icon={<MessageSquare size={22} aria-hidden />}
      title="No conversation selected"
      description="Select a thread from the sidebar to view messages, share files, and schedule meetings."
    />
  );
}
