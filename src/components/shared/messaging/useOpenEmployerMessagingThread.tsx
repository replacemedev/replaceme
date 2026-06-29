"use client";

import { useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ensureMessagingThread } from "@/actions/messaging";

interface UseOpenEmployerMessagingThreadOptions {
  onSuccess?: (threadId: string) => void;
}

export function useOpenEmployerMessagingThread(
  options?: UseOpenEmployerMessagingThreadOptions
) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const openThread = (jobId: string, candidateId: string) => {
    startTransition(async () => {
      const result = await ensureMessagingThread({ jobId, candidateId });

      if (result.success && result.data.threadId) {
        options?.onSuccess?.(result.data.threadId);
        router.push(`/employer/messages?threadId=${result.data.threadId}`);
        return;
      }

      toast.error(
        !result.success ? result.error : "Could not open conversation."
      );
    });
  };

  return { openThread, isPending };
}

interface EmployerOpenMessagingThreadButtonProps {
  jobId: string;
  candidateId: string;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
}

export function EmployerOpenMessagingThreadButton({
  jobId,
  candidateId,
  className,
  children,
  disabled = false,
}: EmployerOpenMessagingThreadButtonProps) {
  const { openThread, isPending } = useOpenEmployerMessagingThread();

  return (
    <button
      type="button"
      className={className}
      disabled={disabled || isPending}
      onClick={() => openThread(jobId, candidateId)}
    >
      {isPending ? "Opening…" : children}
    </button>
  );
}
