"use client";

import { MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export function MessagingEmptyState() {
  return (
    <EmptyState
      icon={<MessageSquare className="h-6 w-6" />}
      title="No Conversation Selected"
      description="Select a thread from the sidebar to view messages, share files, and schedule meetings."
    />
  );
}
