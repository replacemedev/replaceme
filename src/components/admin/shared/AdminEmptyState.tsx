import { EmptyState } from "@/components/shared/EmptyState";
import type { ComponentProps } from "react";

type EmptyStateProps = ComponentProps<typeof EmptyState>;

export function AdminEmptyState(props: EmptyStateProps) {
  return <EmptyState {...props} />;
}
